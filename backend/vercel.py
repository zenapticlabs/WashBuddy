import os
from washbuddy.wsgi import application as app
from whitenoise import WhiteNoise

app = WhiteNoise(app, root=os.path.join(os.path.dirname(__file__), 'static'))