// /app/static/js/api.js

/**
 * Автоматическое определение API URL
 * Работает как на localhost, так и на удаленных серверах
 * Совместимо с телефонами и всеми устройствами
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
  static async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/users/authenticate?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Ошибка авторизации');
    }
    
    return await response.json();
  }
  
  static async register(userData) {
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
        }
      }
    } catch (error) {
      console.warn('Не удалось получить список ролей', error);
    }
    
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        ...userData,
        role_id: roleId
      }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
    
    return await response.json();
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