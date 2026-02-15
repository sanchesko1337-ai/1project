from django.shortcuts import render, redirect
from .models import Asset
from .forms import AssetForm
import os # Импортируем модель, чтобы спрашивать данные
def home(request):
    # ORM Запрос: "Дай мне все объекты Asset из базы"
    assets = Asset.objects.all().order_by('-created_at')
    context_data = {
        'page_title': 'Главная Галерея',
        'assets': assets, # Передаем реальный QuerySet (список)
    }
    return render(request, 'gallery/index.html', context_data)

def about(request):
    return render(request, 'gallery/about.html')

def upload(request):
    return render(request, 'gallery/upload.html')


def upload(request):
    if request.method == 'POST':
    # Сценарий: Пользователь нажал "Отправить"
    # ВАЖНО: Передаем request.FILES, иначе файл потеряется!

        form = AssetForm(request.POST, request.FILES)
        if form.is_valid():
        # Если все поля заполнены верно - сохраняем в БД
            form.save()
            # И перекидываем пользователя на главную
            return redirect('home')
    else:
        # Сценарий: Пользователь просто зашел на страницу (GET)
        form = AssetForm() # Создаем пустую форму
        # Отдаем шаблон, передавая туда форму (заполненную ошибками или пустую)
    return render(request, 'gallery/upload.html', {'form': form})

