import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Poppins', sans-serif;
    background-color: ${({ theme }) => theme.colors.spectraWhite};
    color: ${({ theme }) => theme.colors.spectraBlack};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  /* Custom utility for the neon purple glow */
  .neon-glow {
    box-shadow: 0 0 10px ${({ theme }) => theme.colors.neonPurple},
                0 0 20px ${({ theme }) => theme.colors.neonPurple};
    border: 1px solid ${({ theme }) => theme.colors.neonPurple};
  }

  button, input, textarea {
    font-family: inherit;
  }
`;
