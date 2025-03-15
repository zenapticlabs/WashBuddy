from django.core.management.base import BaseCommand
from carwash.models import WashType, Amenity

class Command(BaseCommand):
    help = 'Prepopulate WashType and Amenity models'

    def handle(self, *args, **kwargs):
        wash_types = [
            ('Touchless wash', 'automatic', 'Clean'),
            ('Tire soak', 'automatic', 'Clean'),
            ('Underbody flush', 'automatic', 'Clean'),
            ('Underbody spray', 'selfservice', 'Clean'),
            ('Triple foam / clear coat foam', 'automatic', 'Polish'),
            ('Tire Shine', 'automatic', 'Polish'),
            ('Wax Treatment', 'automatic', 'Polish'),
            ('Ceramic/Graphine Sealant', 'automatic', 'Polish'),
            ('Rain Repellant', 'automatic', 'Polish'),
            ('Dryer', 'automatic', 'Shine/Dry'),
            ('Air dryer', 'selfservice', 'Shine/Dry'),
            ('Hot wax', 'selfservice', 'Shine/Dry'),
        ]

        amenities = [
            ('Free vacuums', 'automatic'),
            ('Air gun', 'automatic'),
            ('Mat wash station', 'automatic'),
            ('Open 24 hours', 'automatic'),
            ('Free tire air station', 'automatic'),
            ('Fragrant dispenser', 'selfservice'),
            ('Rug/mat machine', 'selfservice'),
            ('Carpet shampoo machine', 'selfservice'),
            ('In-bay vacuum', 'selfservice'),
            ('Credit cards accepted', 'selfservice'),
        ]

        for name, category, subclass in wash_types:
            WashType.objects.get_or_create(name=name, category=category, subclass=subclass)

        for name, category in amenities:
            Amenity.objects.get_or_create(name=name, category=category)

        self.stdout.write(self.style.SUCCESS('Successfully prepopulated WashType and Amenity models'))
