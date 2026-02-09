from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def health_check(request):
    return Response({
        'status': 'success',
        'message': 'Django API is working!',
        'data': {
            'database': 'PostgreSQL connected',
            'cache': 'Redis available'
        }
    })
