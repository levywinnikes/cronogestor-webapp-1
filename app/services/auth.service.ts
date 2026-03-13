export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  type: 'PF' | 'PJ';
  planId: 'BASIC' | 'PREMIUM' | 'FULL';
  document: string; // CPF or CNPJ
  name: string; // Nome Completo ou Razão Social
  email: string;
  challenge: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE';
  planType: 'FREE' | 'PREMIUM';
  isActive: boolean;
}

export interface AuthResponseDto {
  accessToken: string;
  user: User;
}

// Simulando um banco de dados
const DUMMY_USERS: Record<string, User> = {
  'admin@obras.com': {
    id: 'usr-1',
    name: 'Admin da Obra',
    role: 'ADMIN',
    planType: 'PREMIUM',
    isActive: true,
  },
  'funcionario@obras.com': {
    id: 'usr-2',
    name: 'João Trabalhador',
    role: 'EMPLOYEE',
    planType: 'FREE',
    isActive: true,
  },
  'demitido@obras.com': {
    id: 'usr-3',
    name: 'José Demitido',
    role: 'EMPLOYEE',
    planType: 'FREE',
    isActive: false, // Inativo
  }
};

class AuthService {
  async login(data: LoginDto): Promise<AuthResponseDto> {
    // Simulando delay de rede (500ms a 1500ms)
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const user = DUMMY_USERS[data.email];

    // Senha padrão hardcoded para facilitar testes
    if (!user || data.password !== '123456') {
      throw new Error('Credenciais inválidas'); // Mensagem genérica por segurança
    }

    if (!user.isActive) {
      throw new Error('Usuário inativo. Procure o administrador do sistema.');
    }

    // Mock de JWT simples
    const mockToken = btoa(JSON.stringify({ id: user.id, exp: Date.now() + 3600000 }));

    return {
      accessToken: mockToken,
      user
    };
  }

  // Métodos placeholder para futura implementação
  async refresh(): Promise<void> {
    throw new Error('Not implemented');
  }

  async forgotPassword(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Email de recuperação simulado para: ${email}`);
  }

  async register(data: RegisterDto): Promise<AuthResponseDto> {
    // Simulando delay de rede
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));

    // Validando email em uso
    if (DUMMY_USERS[data.email]) {
      throw new Error('Este e-mail já está cadastrado em nosso sistema.');
    }

    // Criando usuário falso no momento do registro
    const newUser: User = {
      id: `usr-${Math.floor(Math.random() * 10000)}`,
      name: data.name,
      role: 'ADMIN', // Quem cria a conta vira ADMIN da própria obra
      planType: data.planId === 'BASIC' ? 'FREE' : 'PREMIUM',
      isActive: true,
    };

    DUMMY_USERS[data.email] = newUser;

    const mockToken = btoa(JSON.stringify({ id: newUser.id, exp: Date.now() + 3600000 }));

    return {
      accessToken: mockToken,
      user: newUser
    };
  }
}

export const authService = new AuthService();
