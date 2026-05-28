from django.db import models

class Room(models.Model):

    name = models.CharField(max_length=100)

    capacity = models.IntegerField()

    location = models.CharField(max_length=100)

    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name