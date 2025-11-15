"""Provider for Callinfo with CTY data management."""
import os
import urllib.request
from pyhamtools import LookupLib, Callinfo


class CallInfoProvider:
    """Provider class for initializing and managing Callinfo with CTY data."""
    
    _instance = None
    _cic = None
    
    def __init__(self):
        if CallInfoProvider._cic is None:
            CallInfoProvider._cic = self._build_callinfo()
    
    @staticmethod
    def _build_callinfo():
        """Build and return Callinfo instance with CTY data."""
        cty_file = os.path.join(os.path.dirname(__file__), 'cty.plist')
        
        # If file doesn't exist, download it
        if not os.path.exists(cty_file):
            print(f"CTY file not found at {cty_file}, downloading...")
            try:
                urllib.request.urlretrieve(
                    'http://www.country-files.com/cty/cty.plist',
                    cty_file
                )
                print(f"Successfully downloaded CTY file to {cty_file}")
            except Exception as e:
                print(f"Warning: Failed to download CTY file: {e}")
                cty_file = None
        
        if cty_file:
            my_lookuplib = LookupLib(lookuptype="countryfile", filename=cty_file)
        else:
            print("Using online country file lookup")
            my_lookuplib = LookupLib(lookuptype="countryfile")
        
        return Callinfo(my_lookuplib)
    
    @staticmethod
    def get():
        """Get or create the Callinfo instance."""
        if CallInfoProvider._cic is None:
            CallInfoProvider()
        return CallInfoProvider._cic

