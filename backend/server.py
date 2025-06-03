from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import uuid
from pymongo import MongoClient
from datetime import datetime

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URL)
db = client.carpooling_app

# Pydantic models
class AdminSettings(BaseModel):
    rate_per_km: float
    payment_info: str
    admin_password: str

class Trip(BaseModel):
    id: Optional[str] = None
    start_location: dict  # {lat, lng, address}
    end_location: dict   # {lat, lng, address}
    distance_km: float
    passengers: List[str]
    payment_method: str  # "card" or "cash"
    cost_per_person: float
    total_cost: float
    created_at: Optional[datetime] = None
    paid: Optional[bool] = False

class TripCreate(BaseModel):
    start_location: dict
    end_location: dict
    distance_km: float
    passengers: List[str]
    payment_method: str

# Initialize admin settings if not exists
@app.on_event("startup")
async def startup_event():
    settings = db.admin_settings.find_one({"_id": "main"})
    if not settings:
        db.admin_settings.insert_one({
            "_id": "main",
            "rate_per_km": 150,  # Default rate in HUF
            "payment_info": "Card: 1234-5678-9012-3456 | Bank: Your Name",
            "admin_password": "admin123"
        })

# Admin endpoints
@app.post("/api/admin/login")
async def admin_login(password: dict):
    settings = db.admin_settings.find_one({"_id": "main"})
    if settings and settings["admin_password"] == password["password"]:
        return {"success": True, "message": "Admin authenticated"}
    raise HTTPException(status_code=401, detail="Invalid password")

@app.get("/api/admin/settings")
async def get_admin_settings():
    settings = db.admin_settings.find_one({"_id": "main"})
    if settings:
        return {
            "rate_per_km": settings["rate_per_km"],
            "payment_info": settings["payment_info"]
        }
    raise HTTPException(status_code=404, detail="Settings not found")

@app.put("/api/admin/settings")
async def update_admin_settings(settings: AdminSettings):
    result = db.admin_settings.update_one(
        {"_id": "main"},
        {"$set": {
            "rate_per_km": settings.rate_per_km,
            "payment_info": settings.payment_info,
            "admin_password": settings.admin_password
        }}
    )
    if result.modified_count:
        return {"message": "Settings updated successfully"}
    raise HTTPException(status_code=404, detail="Settings not found")

@app.get("/api/admin/trips")
async def get_all_trips():
    trips = list(db.trips.find({}, {"_id": 0}))
    return trips

@app.put("/api/admin/trip/{trip_id}/paid")
async def mark_trip_paid(trip_id: str, paid: dict):
    result = db.trips.update_one(
        {"id": trip_id},
        {"$set": {"paid": paid["paid"]}}
    )
    if result.modified_count:
        return {"message": "Trip payment status updated"}
    raise HTTPException(status_code=404, detail="Trip not found")

# User endpoints
@app.get("/api/settings")
async def get_public_settings():
    settings = db.admin_settings.find_one({"_id": "main"})
    if settings:
        return {
            "rate_per_km": settings["rate_per_km"],
            "payment_info": settings["payment_info"]
        }
    raise HTTPException(status_code=404, detail="Settings not found")

@app.post("/api/trips")
async def create_trip(trip: TripCreate):
    settings = db.admin_settings.find_one({"_id": "main"})
    if not settings:
        raise HTTPException(status_code=500, detail="System not configured")
    
    rate = settings["rate_per_km"]
    total_cost = trip.distance_km * rate
    cost_per_person = total_cost / len(trip.passengers) if trip.passengers else total_cost
    
    trip_data = {
        "id": str(uuid.uuid4()),
        "start_location": trip.start_location,
        "end_location": trip.end_location,
        "distance_km": trip.distance_km,
        "passengers": trip.passengers,
        "payment_method": trip.payment_method,
        "cost_per_person": cost_per_person,
        "total_cost": total_cost,
        "created_at": datetime.now(),
        "paid": False
    }
    
    db.trips.insert_one(trip_data)
    trip_data.pop("_id", None)  # Remove MongoDB _id
    return trip_data

@app.get("/api/trips")
async def get_trips():
    trips = list(db.trips.find({}, {"_id": 0}).sort("created_at", -1))
    return trips

@app.get("/api/passengers/summary")
async def get_passenger_summary():
    trips = list(db.trips.find({}, {"_id": 0}))
    summary = {}
    
    for trip in trips:
        for passenger in trip["passengers"]:
            if passenger not in summary:
                summary[passenger] = {
                    "total_distance": 0,
                    "total_cost": 0,
                    "trip_count": 0,
                    "unpaid_cost": 0
                }
            
            summary[passenger]["total_distance"] += trip["distance_km"]
            summary[passenger]["total_cost"] += trip["cost_per_person"]
            summary[passenger]["trip_count"] += 1
            
            if not trip["paid"]:
                summary[passenger]["unpaid_cost"] += trip["cost_per_person"]
    
    return summary

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)