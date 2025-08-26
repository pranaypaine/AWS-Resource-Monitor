from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ec2, s3, rds, lambda_functions, github, webhooks
import uvicorn

app = FastAPI(title="AWS Resource Monitor", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ec2.router, prefix="/api/ec2", tags=["EC2"])
app.include_router(s3.router, prefix="/api/s3", tags=["S3"])
app.include_router(rds.router, prefix="/api/rds", tags=["RDS"])
app.include_router(lambda_functions.router, prefix="/api/lambda", tags=["Lambda"])
app.include_router(github.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")
@app.get("/")
async def root():
    return {"message": "AWS Resource Monitor API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
