from django.shortcuts import render_to_response
from django.http import HttpResponse

# Create your views here.
def mainpage(request):
    return  render_to_response('static/index.html')
