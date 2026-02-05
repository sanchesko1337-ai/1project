from django.shortcuts import render
from django.http import HttpResponse
def home(request):
    return HttpResponse("<h1>Добро пожаловать в 3D хранилище</h1><p>Система работает.</p>")
def about(request):
    return HttpResponse("<h2>Курс веб структуры</h2><p>Система работает.</p>")
