from django.urls import path
from .views import RoomListCreateView
from .views import AvailableRoomsView

urlpatterns = [
    path('', RoomListCreateView.as_view()),
    path('available/', AvailableRoomsView.as_view()),
    
]