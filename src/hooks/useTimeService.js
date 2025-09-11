import { useEffect, useState } from 'react';
import TimeService from '../services/TimeService';

export const useTimeService = () => {
  const [currentDate, setCurrentDate] = useState(TimeService.getCurrentDate());
  const [offsetDays, setOffsetDays] = useState(TimeService.getOffsetDays());

  useEffect(() => {
    // Listen for time changes
    const unsubscribe = TimeService.addListener((newDate, newOffset) => {
      setCurrentDate(newDate);
      setOffsetDays(newOffset);
    });

    // Initialize with current values
    setCurrentDate(TimeService.getCurrentDate());
    setOffsetDays(TimeService.getOffsetDays());

    return unsubscribe;
  }, []);

  return {
    currentDate,
    offsetDays,
    skipDay: TimeService.skipDay.bind(TimeService),
    resetTime: TimeService.resetToCurrentTime.bind(TimeService),
    isSimulated: offsetDays > 0
  };
};