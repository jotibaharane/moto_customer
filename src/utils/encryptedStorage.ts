import EncryptedStorage from 'react-native-encrypted-storage';

const EncryptedPersistStorage = {
  setItem: async (key: string, value: string) => {
    try {
      await EncryptedStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error saving data to EncryptedStorage:', error);
      return false;
    }
  },

  getItem: async (key: string) => {
    try {
      return await EncryptedStorage.getItem(key);
    } catch (error) {
      console.error('Error retrieving data from EncryptedStorage:', error);
      return null;
    }
  },

  removeItem: async (key: string) => {
    try {
      await EncryptedStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data from EncryptedStorage:', error);
    }
  },
};

export default EncryptedPersistStorage;
