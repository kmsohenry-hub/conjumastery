/**
 * Module de gestion du stockage local et des données persistantes
 */

export const Storage = {
  KEYS: {
    DATA: 'conjumaster_data',
    SETTINGS: 'conjumaster_settings',
    CACHE: 'conjumaster_cache',
  },

  /**
   * Sauvegarde les données dans le localStorage
   * @param {string} key - Clé de stockage
   * @param {any} value - Valeur à sauvegarder
   * @returns {boolean} - Succès de l'opération
   */
  save(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Storage.save error for key "${key}":`, error);
      if (error.name === 'QuotaExceededError') {
        this.handleQuotaExceeded();
      }
      return false;
    }
  },

  /**
   * Récupère des données depuis le localStorage
   * @param {string} key - Clé de stockage
   * @param {any} defaultValue - Valeur par défaut si non trouvée
   * @returns {any} - Les données ou la valeur par défaut
   */
  load(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Storage.load error for key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Supprime des données du localStorage
   * @param {string} key - Clé à supprimer
   * @returns {boolean} - Succès de l'opération
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Storage.remove error for key "${key}":`, error);
      return false;
    }
  },

  /**
   * Efface tout le stockage
   * @returns {boolean} - Succès de l'opération
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage.clear error:', error);
      return false;
    }
  },

  /**
   * Vérifie si une clé existe
   * @param {string} key - Clé à vérifier
   * @returns {boolean}
   */
  has(key) {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Storage.has error for key "${key}":`, error);
      return false;
    }
  },

  /**
   * Exporte toutes les données utilisateur au format JSON
   * @returns {string} - JSON string
   */
  exportAllData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('conjumaster_')) {
        try {
          data[key] = this.load(key);
        } catch (e) {
          console.warn(`Failed to export key "${key}":`, e);
        }
      }
    }
    return JSON.stringify(data, null, 2);
  },

  /**
   * Importe des données depuis un fichier JSON
   * @param {string} jsonString - Données JSON à importer
   * @param {boolean} merge - Si true, fusionne avec les données existantes
   * @returns {object} - Résultat de l'import
   */
  importAllData(jsonString, merge = true) {
    try {
      const data = JSON.parse(jsonString);
      const results = {
        success: 0,
        failed: 0,
        errors: [],
      };

      for (const [key, value] of Object.entries(data)) {
        if (!key.startsWith('conjumaster_')) {
          continue;
        }
        
        try {
          if (merge && this.has(key)) {
            const existing = this.load(key);
            const merged = { ...existing, ...value };
            this.save(key, merged);
          } else {
            this.save(key, value);
          }
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({ key, error: error.message });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Invalid JSON data: ${error.message}`);
    }
  },

  /**
   * Gère le dépassement de quota de stockage
   */
  handleQuotaExceeded() {
    console.warn('LocalStorage quota exceeded. Attempting to clean up...');
    
    // Nettoie le cache en premier
    const cacheKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('cache')) {
        cacheKeys.push(key);
      }
    }
    
    cacheKeys.forEach(key => this.remove(key));
    
    // Si toujours plein, alerte l'utilisateur
    try {
      localStorage.setItem('_test_quota', 'test');
      localStorage.removeItem('_test_quota');
    } catch (e) {
      alert(
        '⚠️ Stockage local saturé !\n\n' +
        'Veuillez exporter vos données (Paramètres > Exporter) ' +
        'puis effacer certaines données pour continuer.'
      );
    }
  },

  /**
   * Calcule l'espace de stockage utilisé
   * @returns {object} - Informations sur l'utilisation
   */
  getStorageInfo() {
    let totalSize = 0;
    const details = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        const size = (key.length + value.length) * 2; // Approximation en octets
        totalSize += size;
        details[key] = size;
      }
    }
    
    return {
      totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      itemCount: localStorage.length,
      details,
      quotaLimit: '5MB (localStorage standard)',
    };
  },
};
