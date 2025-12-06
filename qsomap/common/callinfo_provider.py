"""Provider for Callinfo with Redis caching."""
import os
import logging
import redis
from pyhamtools import LookupLib, Callinfo

# Configure logging
logger = logging.getLogger(__name__)

# Redis prefix matching populate_redis.py
REDIS_PREFIX = "CF"


class CallInfoProvider:
    """Provider class for initializing and managing Callinfo with Redis caching."""
    
    _instance = None
    _cic = None
    
    def __init__(self):
        if CallInfoProvider._cic is None:
            CallInfoProvider._cic = self._build_callinfo()
    
    @staticmethod
    def _should_use_redis():
        """Check if Redis should be used for country file."""
        use_redis = os.environ.get('USE_COUNTRYFILE_FROM_REDIS', 'false').lower() in ('true', '1', 'yes')
        return use_redis
    
    @staticmethod
    def _get_redis_client():
        """Get or create Redis client."""
        try:
            redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
            # decode_responses=False is required for pyhamtools to properly deserialize data
            client = redis.from_url(redis_url, decode_responses=False)
            client.ping()
            logger.info("✓ Redis connection successful")
            return client
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}")
            return None
    
    @staticmethod
    def _build_callinfo():
        """Build and return Callinfo instance with optional Redis caching."""
        
        # If Redis is enabled, try to use it
        if CallInfoProvider._should_use_redis():
            redis_client = CallInfoProvider._get_redis_client()
            if redis_client:
                try:
                    logger.info("Creating LookupLib with Redis backend (USE_COUNTRYFILE_FROM_REDIS=true)")
                    # Use Redis directly via pyhamtools LookupLib
                    my_lookuplib = LookupLib(
                        lookuptype="redis",
                        redis_instance=redis_client,
                        redis_prefix=REDIS_PREFIX
                    )
                    return Callinfo(my_lookuplib)
                except Exception as e:
                    logger.warning(f"Failed to create Redis-backed LookupLib: {e}")
                    logger.info("Falling back to file-based lookup")
            else:
                logger.warning("USE_COUNTRYFILE_FROM_REDIS=true but Redis not available")
                logger.info("Falling back to file-based lookup")
        
        # Fallback: Use file-based country file
        logger.info("Using file-based country file lookup (USE_COUNTRYFILE_FROM_REDIS=false)")
        cty_file = os.path.join(os.path.dirname(__file__), 'cty.plist')
        
        # Check if file exists locally (bundled with Docker image or pre-downloaded)
        if os.path.exists(cty_file):
            logger.info(f"CTY file found at {cty_file}, using local copy")
            try:
                my_lookuplib = LookupLib(lookuptype="countryfile", filename=cty_file)
                return Callinfo(my_lookuplib)
            except Exception as e:
                logger.warning(f"Failed to load local CTY file: {e}")
                logger.info("Falling back to online country file lookup")
                return Callinfo(LookupLib(lookuptype="countryfile"))
        else:
            logger.error(f"CTY file not found at {cty_file}")
            logger.info("Using online country file lookup")
            return Callinfo(LookupLib(lookuptype="countryfile"))
    
    @staticmethod
    def get():
        """Get or create the Callinfo instance."""
        if CallInfoProvider._cic is None:
            CallInfoProvider()
        return CallInfoProvider._cic
