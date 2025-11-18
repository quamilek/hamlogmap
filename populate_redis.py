#!/usr/bin/env python3
"""
Script to populate Redis with country data from pyhamtools.
Uses pyhamtools copy_data_in_redis() method to copy lookup data to Redis.
Run this during app initialization or manually to cache country data.
"""
import os
import logging
import redis
from pyhamtools import LookupLib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Redis prefix for storing country file data
REDIS_PREFIX = "CF"


def get_redis_client():
    """Get Redis client connection."""
    redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    return redis.from_url(redis_url, decode_responses=False)


def populate_redis_from_countryfile():
    """
    Populate Redis with country file data using pyhamtools.copy_data_in_redis().
    
    This is the recommended way according to pyhamtools documentation.
    """
    logger.info("Populating Redis with country file data using pyhamtools...")
    
    try:
        # Get Redis connection
        r = get_redis_client()
        
        # Test connection
        r.ping()
        logger.info("✓ Redis connection successful")
        
        # Load country file data
        cty_file = os.path.join(os.path.dirname(__file__), 'qsomap', 'common', 'cty.plist')
        if os.path.exists(cty_file):
            logger.info(f"Using local country file: {cty_file}")
            my_lookuplib = LookupLib(lookuptype="countryfile", filename=cty_file)
        else:
            logger.info("Using online country file from pyhamtools")
            my_lookuplib = LookupLib(lookuptype="countryfile")
        
        # Copy data to Redis using pyhamtools
        logger.info(f"Copying lookup data to Redis with prefix '{REDIS_PREFIX}'...")
        result = my_lookuplib.copy_data_in_redis(redis_prefix=REDIS_PREFIX, redis_instance=r)
        
        if result:
            logger.info(f"✓ Successfully copied lookup data to Redis")
            
            # Verify by counting keys
            key_pattern = f"{REDIS_PREFIX}*".encode()
            count = r.keys(key_pattern)
            logger.info(f"✓ Redis now contains {len(count)} keys with prefix '{REDIS_PREFIX}'")
            
            return True
        else:
            logger.error("✗ Failed to copy data to Redis")
            return False
    
    except Exception as e:
        logger.error(f"✗ Error populating Redis: {e}")
        return False


def verify_redis():
    """Verify Redis data."""
    try:
        r = get_redis_client()
        
        # Check connection
        r.ping()
        logger.info("✓ Redis connection successful")
        
        # Count total keys
        count = r.dbsize()
        logger.info(f"✓ Redis contains {count} keys total")
        
        # Show sample CF keys
        key_pattern = f"{REDIS_PREFIX}:*".encode()
        sample_keys = r.keys(key_pattern)[:3]
        if sample_keys:
            logger.info(f"Sample keys with prefix '{REDIS_PREFIX}':")
            for key in sample_keys:
                logger.info(f"  {key.decode() if isinstance(key, bytes) else key}")
        
        return True
    
    except Exception as e:
        logger.error(f"✗ Redis verification failed: {e}")
        return False


if __name__ == '__main__':
    logger.info("🚀 HamLogMap Redis Population Script")
    logger.info("=" * 50)
    
    # Populate Redis
    if populate_redis_from_countryfile():
        # Verify
        verify_redis()
        logger.info("✅ Redis population completed successfully!")
    else:
        logger.error("❌ Redis population failed!")
        exit(1)
