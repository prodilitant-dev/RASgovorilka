import { ref, computed, reactive } from 'vue';

export function useTimer(initialMinutes = 1) {
  const totalSeconds = ref(initialMinutes * 60);
  const secondsLeft = ref(totalSeconds.value);
  const isRunning = ref(false);
  let intervalId = null;

  const display = computed(() => {
    const m = Math.floor(secondsLeft.value / 60);
    const s = secondsLeft.value % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  });

  function start() {
    if (isRunning.value) return;
    isRunning.value = true;
    intervalId = setInterval(() => {
      if (secondsLeft.value > 0) {
        secondsLeft.value--;
      } else {
        stop();
      }
    }, 1000);
  }

  function stop() {
    isRunning.value = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function reset(minutes) {
    stop();
    if (minutes !== undefined) totalSeconds.value = minutes * 60;
    secondsLeft.value = totalSeconds.value;
  }

  function setMinutes(minutes) {
    totalSeconds.value = minutes * 60;
    secondsLeft.value = totalSeconds.value;
  }

  // Очистка при уничтожении компонента
  // (но Vue автоматически вызовет onUnmounted, если мы используем в setup)
  // Здесь мы просто предоставим метод cleanup, который можно вызвать вручную.
  function cleanup() {
    stop();
  }

  return reactive({
    secondsLeft,
    display,
    isRunning,
    start,
    stop,
    reset,
    setMinutes,
    cleanup
  });
}
