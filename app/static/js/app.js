// ПОПРАВКА: Исправить функцию createAccountListing
// Заменяем section с функцией createAccountListing

// Функция исправлена в следующем формате:
async function createAccountListing(listingData) {
  try {
    const user = AppState.user;
    if (!user) {
      showToast('Для публикации нужно войти в аккаунт', 'error');
      return null;
    }
    
    console.log('Отправка авторского издания на сервер:', listingData);
    
    // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Используем правильные названия полей
    // согласно схеме AuthorListingCreate на бэкенде
    const requestData = {
      title: listingData.title,
      prise: parseFloat(listingData.price) || 0,  // ⚠️ На бэкенде поле называется 'prise' (опечатка!)
      topics_games: listingData.topic || '',       // ⚠️ На бэкенде 'topics_games' вместо 'topic'
      image_url: listingData.thumb || 'https://via.placeholder.com/400x200?text=Издание',
      user_id: user.id,
      status: 'active'
    };
    
    console.log('Данные для отправки:', requestData);
    
    const response = await fetch(`${API_BASE_URL}/author-listings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    console.log('Ответ сервера:', response.status, response.statusText);
    
    if (response.ok) {
      const newListing = await response.json();
      console.log('Авторское издание успешно создано:', newListing);
      showToast('Авторское издание успешно создано!', 'success');
      return newListing;
    } else {
      // Правильная обработка ошибок
      let errorMessage = 'Ошибка создания издания';
      try {
        const errorData = await response.json();
        console.log('Ошибка от сервера (JSON):', errorData);
        
        // Если есть детали валидации
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Это список ошибок валидации от Pydantic
            errorMessage = errorData.detail
              .map(err => `${err.loc.join('.')}: ${err.msg}`)
              .join('; ');
          } else {
            errorMessage = errorData.detail;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        const errorText = await response.text();
        console.error('Текст ошибки:', errorText);
        errorMessage = `Ошибка сервера (${response.status}): ${errorText || response.statusText}`;
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Ошибка создания авторского издания:', error);
    showToast(error.message || 'Ошибка создания издания', 'error');
    return null;
  }
}

// Также исправляем функцию setupListingForms для правильной передачи данных
function setupListingFormsFixed() {
  // ... остальной код ...
  
  if (createAccListing) {
    createAccListing.addEventListener('click', async () => {
      const title = document.getElementById('accListTitle').value.trim();
      const price = parseFloat(document.getElementById('accListPrice').value) || 0;
      const games = document.getElementById('accListGames').value.trim();
      const thumb = document.getElementById('accListThumb').value.trim();
      
      if (!title || !games) {
        showToast('Заполните название и темы', 'error');
        return;
      }
      
      // ✅ ИСПРАВЛЕНО: Используем правильные названия полей
      const listingData = {
        title,
        price,  // Будет преобразовано в 'prise' в createAccountListing
        topic: games,  // Будет преобразовано в 'topics_games' в createAccountListing
        thumb  // Будет преобразовано в 'image_url' в createAccountListing
      };
      
      const newListing = await createAccountListing(listingData);
      if (newListing) {
        AppState.accountListings.unshift(newListing);
        renderAccountListings();
        accListingForm.style.display = 'none';
        openAccListForm.style.display = 'block';
        
        // Очищаем форму
        document.getElementById('accListTitle').value = '';
        document.getElementById('accListPrice').value = '';
        document.getElementById('accListGames').value = '';
        document.getElementById('accListThumb').value = '';
      }
    });
  }
}