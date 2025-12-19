// /app/static/js/api.js
// API configuration with mobile support

function getApiBaseUrl() {
  // На localhost используем 8000
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  
  // Для мобильного доступа используем текущий хост и порт
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';
  
  return `${protocol}//${hostname}${port}`;
}

const API_BASE_URL = getApiBaseUrl();

// Debug информация
console.log('%c=== API SERVICE ===', 'color: #00aaff; font-weight: bold;');
console.log('API_BASE_URL:', API_BASE_URL);
console.log('Current hostname:', window.location.hostname);
console.log('Current URL:', window.location.href);

class ApiService {
  static async login(email, password) {
    console.log('🔍 Попытка авторизации:', email);
    
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);
    
    const url = `${API_BASE_URL}/users/authenticate?${params.toString()}`;
    console.log('🌐 URL запроса:', url);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include',
        mode: 'cors'
      });
      
      console.log('📊 Статус ответа:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('✖️ Ошибка авторизации:', errorData);
        throw new Error(errorData.detail || 'Ошибка авторизации');
      }
      
      const data = await response.json();
      console.log('✅ Успешная авторизация:', data);
      return data;
    } catch (error) {
      console.error('❌ Ошибка login:', error.message);
      throw error;
    }
  }
  
  static async register(userData) {
    console.log('👤 Попытка регистрации:', userData.email);
    
    let roleId = 2;
    
    try {
      const rolesResponse = await fetch(`${API_BASE_URL}/roles/`, {
        credentials: 'include',
        mode: 'cors'
      });
      if (rolesResponse.ok) {
        const roles = await rolesResponse.json();
        const defaultRole = roles.find(role => 
          role.name.toLowerCase() === 'user' || 
          role.name.toLowerCase() === 'client'
        );
        if (defaultRole) {
          roleId = defaultRole.id;
          console.log('🔍 Найдена роль:', roleId);
        }
      }
    } catch (error) {
      console.warn('⚠️ Не удалось получить роли:', error);
    }
    
    const registrationData = {
      ...userData,
      role_id: roleId
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(registrationData),
        credentials: 'include',
        mode: 'cors'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('✖️ Ошибка регистрации:', errorData);
        throw errorData;
      }
      
      const data = await response.json();
      console.log('✅ Успешная регистрация:', data);
      return data;
    } catch (error) {
      console.error('❌ Ошибка register:', error);
      throw error;
    }
  }
  
  static async getUserProfile(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        credentials: 'include',
        mode: 'cors'
      });
      if (!response.ok) {
        throw new Error('Не удалось получить профиль пользователя');
      }
      return await response.json();
    } catch (error) {
      console.error('❌ Ошибка getUserProfile:', error);
      throw error;
    }
  }
  
  static async updateUserProfile(userId, userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error('Не удалось обновить профиль пользователя');
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Ошибка updateUserProfile:', error);
      throw error;
    }
  }
  
  static async getProducts(skip = 0, limit = 100, category = null) {
    try {
      let url = `${API_BASE_URL}/products/?skip=${skip}&limit=${limit}`;
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include',
        mode: 'cors'
      });
      if (!response.ok) {
        throw new Error('Не удалось получить товары');
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Ошибка getProducts:', error);
      throw error;
    }
  }
  
  static async getCartItems(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/carts/user/${userId}`, {
        credentials: 'include',
        mode: 'cors'
      });
      if (!response.ok) {
        throw new Error('Не удалось получить корзину');
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Ошибка getCartItems:', error);
      throw error;
    }
  }

  static async healthCheck() {
    try {
      console.log('🏥 Проверка здоровья сервера:', API_BASE_URL + '/health');
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Сервер вернул статус ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Сервер здоров:', data);
      return { ok: true, data };
    } catch (error) {
      console.error('❌ Ошибка подключения к серверу:', error.message);
      console.error('Проверьте:');
      console.error('1. Сервер запущен на: ' + API_BASE_URL);
      console.error('2. Для мобильного: используйте IP адрес вместо localhost');
      console.error('3. Firewall не блокирует порт 8000');
      return { ok: false, error: error.message };
    }
  }
}

// Проверяем здоровье при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Страница загружена, проверяем сервер...');
  ApiService.healthCheck().catch(err => {
    console.warn('⚠️ Проблема здоровья:', err);
  });
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiService;
} else {
  window.ApiService = ApiService;
}