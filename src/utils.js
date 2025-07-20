import moment from 'moment'

// Theme initialization function
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('dream-speak-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  return savedTheme;
};

export const formatDreamDate = (dateString) => {
  if (!dateString) return 'No date'
  
  console.log('🔍 formatDreamDate input:', dateString, typeof dateString)
  
  const momentDate = moment(dateString)
  console.log('🔍 moment result:', momentDate.format(), 'valid:', momentDate.isValid())
  
  if (!momentDate.isValid()) {
    return 'Invalid date'
  }
  
  // If it's today, show "Today"
  if (momentDate.isSame(moment(), 'day')) {
    return 'Today'
  }
  
  // If it's yesterday, show "Yesterday"
  if (momentDate.isSame(moment().subtract(1, 'day'), 'day')) {
    return 'Yesterday'
  }
  
  // If it's within the last 7 days, show the day name
  if (momentDate.isAfter(moment().subtract(7, 'days'))) {
    return momentDate.format('dddd')
  }
  
  // Otherwise show the date in a nice format
  return momentDate.format('MMM D')
}

export const formatFullDate = (dateString) => {
  if (!dateString) return 'No date'
  
  const momentDate = moment(dateString)
  if (!momentDate.isValid()) {
    return 'Invalid date'
  }
  
  return momentDate.format('MMMM D, YYYY')
}

export const themes = [
    { name: 'light', colors: ['#570df8', '#f000b8', '#37cdbe', '#3d4451'] },
    { name: 'dark', colors: ['#661AE6', '#D926A9', '#1FB2A6', '#D99330'] },
    { name: 'cupcake', colors: ['#65c3c8', '#ffcccb', '#ffdde2', '#e7dedc'] },
    { name: 'bumblebee', colors: ['#FFBF00', '#E4A000', '#292524', '#E5E5E5'] },
    { name: 'emerald', colors: ['#66cc8a', '#ffd700', '#1f2937', '#4b5563'] },
    { name: 'corporate', colors: ['#4A89DC', '#37CDBE', '#34C6C0', '#A1AAB2'] },
    { name: 'synthwave', colors: ['#EE82EE', '#D626FF', '#FCBD06', '#38353C'] },
    { name: 'retro', colors: ['#FABD2F', '#D7827E', '#988BC7', '#FE5E5E'] },
    { name: 'cyberpunk', colors: ['#ff7597', '#ffb86c', '#8be9fd', '#50fa7b'] },
    { name: 'valentine', colors: ['#ffafcc', '#ffb3c6', '#ffb3c6', '#ffb3c6'] },
    { name: 'halloween', colors: ['#ff7518', '#ffb347', '#ff7518', '#ffb347'] },
    { name: 'garden', colors: ['#4caf50', '#8bc34a', '#cddc39', '#ffeb3b'] },
    { name: 'forest', colors: ['#228b22', '#2e8b57', '#3cb371', '#66cdaa'] },
    { name: 'aqua', colors: ['#00ffff', '#7fffd4', '#40e0d0', '#48d1cc'] },
    { name: 'lofi', colors: ['#f5f5f5', '#dcdcdc', '#a9a9a9', '#808080'] },
    { name: 'pastel', colors: ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9'] },
    { name: 'fantasy', colors: ['#ffb6c1', '#ff69b4', '#ff1493', '#db7093'] },
    { name: 'wireframe', colors: ['#d3d3d3', '#a9a9a9', '#808080', '#696969'] },
    { name: 'black', colors: ['#000000', '#2f2f2f', '#4f4f4f', '#6f6f6f'] },
    { name: 'luxury', colors: ['#ffd700', '#daa520', '#b8860b', '#8b4513'] },
    { name: 'dracula', colors: ['#ff79c6', '#bd93f9', '#ffb86c', '#ff5555'] },
    { name: 'cmyk', colors: ['#00bcd4', '#ffeb3b', '#ff5722', '#9c27b0'] },
    { name: 'autumn', colors: ['#d2691e', '#ff7f50', '#ff6347', '#ff4500'] },
    { name: 'business', colors: ['#1e40af', '#1e3a8a', '#1e3a8a', '#1e3a8a'] },
    { name: 'acid', colors: ['#84cc16', '#a3e635', '#bef264', '#d9f99d'] },
    { name: 'lemonade', colors: ['#fde68a', '#fcd34d', '#fbbf24', '#f59e0b'] },
    { name: 'night', colors: ['#1e3a8a', '#1e40af', '#1e3a8a', '#1e40af'] },
    { name: 'coffee', colors: ['#6b7280', '#4b5563', '#374151', '#1f2937'] },
    { name: 'winter', colors: ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'] },
];

// Function to get the dynamic API URL based on current protocol and hostname
export const getApiUrl = () => {
  const apiProtocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
  const apiHost = window.location.hostname === '192.168.0.65' ? '192.168.0.65' : 'localhost'
  return `${apiProtocol}//${apiHost}:4000/graphql`
}