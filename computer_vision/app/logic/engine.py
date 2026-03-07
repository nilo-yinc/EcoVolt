# app/logic/engine.py
import time

class WasteDetector:
    
    def __init__(self, delay_seconds=5):
        # How long the room must be empty before we declare energy is being wasted
        self.delay_seconds = delay_seconds
        self.empty_since = None
        self.waste_active = False

    def update(self, person_count, appliance_active):
        
        condition_met = (person_count == 0) and appliance_active

        if condition_met:
            if self.empty_since is None:
                self.empty_since = time.time()
        
            elif time.time() - self.empty_since >= self.delay_seconds:
                self.waste_active = True
                
        else: 
            # If someone walks in (person_count > 0) OR appliances are turned off manually,
            # reset the timer immediately so we don't accidentally turn off the lights.
            self.empty_since = None
            self.waste_active = False

        return self.waste_active