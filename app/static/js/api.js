// /app/static/js/api.js

/**
 * Автоматическое определение API URL
 * Работает как на localhost, так и на удаленных серверах
 * Совместимо с телефонами и всем устройствами
 */
function getApiBaseUrl() {
  // Если текущий хост - localhost, используем :8000
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  
  // Иначе используем текущий хост и порт (для удаленных серверов и телефонов)
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';
  
  return `${protocol}//${hostname}${port}`;
}

const API_BASE_URL = getApiBaseUrl();

// Логируем для отладки
console.log('API_BASE_URL:', API_BASE_URL);
console.log('Current hostname:', window.location.hostname);
console.log('Current URL:', window.location.href);

class ApiService {
  /**
   * Автентификация пользователя
   * Поддерживает query параметры и POST
   */
  static async login(email, password) {
    console.log('🔍 Аттемпт авторизации:', email);
    
    // Отправляем email и password как query parameters
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);
    
    const url = `${API_BASE_URL}/users/authenticate?${params.toString()}`;
    console.log('🌐 УРЛ:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include'
    });
    
    console.log('🔍 Ответ от сервера:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('✖️ Ошибка авторизации:', errorData);
      throw new Error(errorData.detail || 'Ошибка авторизации');
    }
    
    const data = await response.json();
    console.log('✅ Успешная авторизация:', data);
    return data;
  }
  
  /**
   * Регистрация нового пользователя
   */
  static async register(userData) {
    console.log('👆 Попытка регистрации:', userData.email);
    
    // Получаем роль по умолчанию
    let roleId = 2;
    
    try {
      const rolesResponse = await fetch(`${API_BASE_URL}/roles/`, {
        credentials: 'include'
      });
      if (rolesResponse.ok) {
        const roles = await rolesResponse.json();
        const defaultRole = roles.find(role => 
          role.name.toLowerCase() === 'user' || 
          role.name.toLowerCase() === 'client'
        );
        if (defaultRole) {
          roleId = defaultRole.id;
          console.log('🕒 Найдена роль:', roleId);
        }
      }
    } catch (error) {
      console.warn('⚠️ Не удалось получить список ролей', error);
    }
    
    // Подготавливаем данные для регистрации
    const registrationData = {
      ...userData,
      role_id: roleId
    };
    
    console.log('📄 Отправляем данные регистрации:', registrationData);
    
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(registrationData),
      credentials: 'include'
    });
    
    console.log('🔍 Ответ регистрации:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('✖️ Ошибка регистрации:', errorData);
      throw errorData;
    }
    
    const data = await response.json();
    console.log('✅ Успешная регистрация:', data);
    return data;
  }
  
  static async getUserProfile(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Не удалось получить данные пользователя');
    }
    return await response.json();
  }
  
  static async updateUserProfile(userId, userData) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Не удалось обновить данные пользователя');
    }
    
    return await response.json();
  }
  
  // Методы для работы с товарами, корзиной и т.д.
  static async getProducts(skip = 0, limit = 100, category = null) {
    let url = `${API_BASE_URL}/products/?skip=${skip}&limit=${limit}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    
    const response = await fetch(url, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Не удалось получить список товаров');
    }
    
    return await response.json();
  }
  
  static async getCartItems(userId) {
    const response = await fetch(`${API_BASE_URL}/carts/user/${userId}`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Не удалось получить корзину');
    }
    
    return await response.json();
  }
}

// Экспортируем для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiService;
} else {
  window.ApiService = ApiService;
}