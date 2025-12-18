// исправленная createAccountListing с правильными названиями полей
async function createAccountListing(listingData) {
  try {
    const user = AppState.user;
    if (!user) {
      showToast('Для публикации нужно войти в аккаунт', 'error');
      return null;
    }
    
    console.log('Отправка авторского издания на сервер:', listingData);
    
    // ✅ КРИТИЧНОЕ ИСПРАВЛЕНИЕ: Преобразуем поля в формат бэкенда
    // согласно app/schemas/author_listing_schema.py
    const requestData = {
      title: listingData.title,
      prise: parseFloat(listingData.price) || 0,      // ⚠️ price -> prise
      topics_games: listingData.topic || '',          // ⚠️ topic -> topics_games
      image_url: listingData.thumb || 'https://via.placeholder.com/400x200?text=Издание',  // ⚠️ thumb -> image_url
      user_id: user.id,                               // ⚠️ Обязательное поле
      status: 'active'                                // ⚠️ status вместо is_active
    };
    
    console.log('Преобразованные данные:', requestData);
    
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
      console.log('✅ Авторское издание создано:', newListing);
      showToast('Авторское издание успешно создано!', 'success');
      return newListing;
    } else {
      // Обработка ошибок валидации Pydantic
      let errorMessage = 'Ошибка создания издания';
      try {
        const errorData = await response.json();
        console.log('Ошибка от сервера:', errorData);
        
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Ошибки валидации Pydantic
            errorMessage = errorData.detail
              .map(err => `Поле ${err.loc.join('.')}: ${err.msg}`)
              .join('\n');
          } else {
            errorMessage = errorData.detail;
          }
        }
      } catch (parseError) {
        const errorText = await response.text();
        errorMessage = `Ошибка (${response.status}): ${errorText}`;
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Ошибка:', error);
    showToast(error.message || 'Ошибка создания издания', 'error');
    return null;
  }
}