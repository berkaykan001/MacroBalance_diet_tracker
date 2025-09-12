import AsyncStorage from '@react-native-async-storage/async-storage';

class TimeService {
  constructor() {
    this.offsetDays = 0;
    this.listeners = [];
    this.dayResetHour = 4; // Default reset hour
    this.loadOffset();
  }

  async loadOffset() {
    try {
      const storedOffset = await AsyncStorage.getItem('timeOffset');
      if (storedOffset !== null) {
        this.offsetDays = parseInt(storedOffset, 10);
      }
    } catch (error) {
      console.warn('Failed to load time offset:', error);
    }
  }

  async saveOffset() {
    try {
      await AsyncStorage.setItem('timeOffset', this.offsetDays.toString());
    } catch (error) {
      console.warn('Failed to save time offset:', error);
    }
  }

  now() {
    const realNow = Date.now();
    return realNow + (this.offsetDays * 24 * 60 * 60 * 1000);
  }

  getCurrentDate() {
    return new Date(this.now());
  }

  async skipDay() {
    this.offsetDays += 1;
    await this.saveOffset();
    this.notifyListeners();
    return this.getCurrentDate();
  }

  async resetToCurrentTime() {
    this.offsetDays = 0;
    await this.saveOffset();
    this.notifyListeners();
    return this.getCurrentDate();
  }

  // Event system for components to react to time changes
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.getCurrentDate(), this.offsetDays);
      } catch (error) {
        console.warn('TimeService listener error:', error);
      }
    });
  }

  getOffsetDays() {
    return this.offsetDays;
  }

  // Helper methods that apps typically need
  today() {
    const current = this.getCurrentDate();
    return new Date(current.getFullYear(), current.getMonth(), current.getDate());
  }

  // Get today's date string accounting for custom day reset hour
  getTodayString(dayResetHour = null) {
    const resetHour = dayResetHour ?? this.dayResetHour;
    const currentDate = new Date(this.getCurrentDate()); // Create a copy!
    // If it's before the reset hour, consider it as the previous day
    if (currentDate.getHours() < resetHour) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    return currentDate.toDateString();
  }

  // Set the day reset hour (called by app when settings change)
  setDayResetHour(hour) {
    this.dayResetHour = hour;
  }

  format(date = null) {
    const targetDate = date || this.getCurrentDate();
    return targetDate.toISOString();
  }

  formatShort(date = null) {
    const targetDate = date || this.getCurrentDate();
    return targetDate.toISOString().split('T')[0];
  }
}

// Export a singleton instance
export default new TimeService();