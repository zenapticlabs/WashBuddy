
from django.core.exceptions import ImproperlyConfigured

from mapwidgets.settings import mw_settings
from mapwidgets.widgets.base import BasePointFieldInteractiveWidget


class RadarMapPointFieldWidget(BasePointFieldInteractiveWidget):
    template_name = "mapwidgets/pointfield/radarmap/interactive.html"
    _settings = mw_settings.RadarMap.PointField.interactive

    @property
    def settings(self):
        settings = super().settings
        if mw_settings.RadarMap.apiKey is None:
            raise ImproperlyConfigured(
                "`RadarMap.apiKey` setting is required to use RadarMap widgets."
            )
        settings["apiKey"] = mw_settings.RadarMap.apiKey
        return settings

    @property
    def media(self):
        return self._media(
            extra_js=[
                "https://js.radar.com/v4.5.5/radar.min.js",
            ],
            extra_css=[
                "https://js.radar.com/v4.5.5/radar.css"
            ],
        )