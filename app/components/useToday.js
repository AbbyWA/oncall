import { useState, useEffect } from 'react';

const useToday = () => {
  const [today, setToday] = useState(
    new Date().pattern('yyyy-MM-dd EEE hh:mm:ss')
  );
  useEffect(() => {
    setInterval(() => {
      setToday(new Date().pattern('yyyy-MM-dd EEE hh:mm:ss'));
    }, 1000);
  }, []);

  return [today, setToday];
};

export default useToday;
