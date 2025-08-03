VERSION = (0, 5, 0)
__version__ = ".".join(map(str, VERSION))

from .widgets import (
    RadarMapPointFieldWidget
)

__all__ = [
    "RadarMapPointFieldWidget"
]
