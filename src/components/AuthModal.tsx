import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Eye, EyeOff, LogIn, UserPlus, Gift } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { supabase } from '../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [loginDni, setLoginDni] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [registerData, setRegisterData] = useState({
    fullName: '',
    dni: '',
    phone: '',
    cvuAlias: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .rpc('verify_user', {
          p_dni: loginDni,
          p_password: loginPassword
        });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        onLogin(data[0]);
        onClose();
      } else {
        setError('DNI o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (registerData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .rpc('create_user_with_referral', {
          p_full_name: registerData.fullName,
          p_dni: registerData.dni,
          p_phone: registerData.phone,
          p_cvu_alias: registerData.cvuAlias,
          p_password: registerData.password,
          p_referral_code: registerData.referralCode || null
        });
      
      if (error) {
        if (error.message.includes('unique constraint')) {
          setError('Ya existe un usuario con ese DNI');
        } else {
          throw error;
        }
        return;
      }
      
      const { data: loginData } = await supabase
        .rpc('verify_user', {
          p_dni: registerData.dni,
          p_password: registerData.password
        });
      
      if (loginData && loginData.length > 0) {
        onLogin({
          ...loginData[0],
          referralCode: data[0]?.code
        });
        onClose();
      }
    } catch (err) {
      setError('Error al crear cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-b from-[#1a0a3e] to-[#0f0518] rounded-2xl w-full max-w-md border border-white/20 overflow-hidden"
      >
        <div className="flex border-b border-white/10">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              mode === 'login' 
                ? 'text-white border-b-2 border-violet-500 bg-white/5' 
                : 'text-white/50 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4 inline mr-2" />
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              mode === 'register' 
                ? 'text-white border-b-2 border-violet-500 bg-white/5' 
                : 'text-white/50 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Crear Cuenta
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <Label className="text-white/60 text-sm">DNI</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <Input
                      value={loginDni}
                      onChange={(e) => setLoginDni(e.target.value)}
                      placeholder="35.456.789"
                      required
                      className="pl-10 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white/60 text-sm">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••"
                      required
                      className="pl-10 pr-10 bg-white/5 border-white/10 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-violet-500 hover:bg-violet-600 text-white"
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div>
                  <Label className="text-white/60 text-sm">Nombre Completo</Label>
                  <Input
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({...registerData, fullName: e.target.value})}
                    placeholder="Juan Pérez"
                    required
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/60 text-sm">DNI</Label>
                    <Input
                      value={registerData.dni}
                      onChange={(e) => setRegisterData({...registerData, dni: e.target.value})}
                      placeholder="35.456.789"
                      required
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white/60 text-sm">Teléfono</Label>
                    <Input
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                      placeholder="11 1234-5678"
                      required
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white/60 text-sm">CVU o Alias</Label>
                  <Input
                    value={registerData.cvuAlias}
                    onChange={(e) => setRegisterData({...registerData, cvuAlias: e.target.value})}
                    placeholder="tu.alias.mp"
                    required
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white/60 text-sm">Contraseña</Label>
                  <Input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white/60 text-sm">Confirmar Contraseña</Label>
                  <Input
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                    placeholder="Repetir contraseña"
                    required
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white/60 text-sm flex items-center gap-2">
                    <Gift className="w-4 h-4 text-yellow-400" />
                    Código de Referido (opcional)
                  </Label>
                  <Input
                    value={registerData.referralCode}
                    onChange={(e) => setRegisterData({...registerData, referralCode: e.target.value.toUpperCase()})}
                    placeholder="Ej: ABC1234"
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <p className="text-xs text-white/40 mt-1">
                    Si tenés un código de un amigo, ingresalo acá
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  {isLoading ? 'Creando...' : 'Crear Cuenta'}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function AdminLogin({ isOpen, onClose, onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .rpc('verify_admin', {
          p_username: username,
          p_password: password
        });
      
      if (error) throw error;
      
      if (data) {
        localStorage.setItem('rifaflash_admin_session', 'true');
        onLogin();
        onClose();
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error al verificar credenciales');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-b from-red-950 to-[#0f0518] rounded-2xl w-full max-w-md border border-red-500/30 p-6"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Acceso Admin</h2>
          <p className="text-white/50 text-sm mt-1">Panel de administración protegido</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-white/60 text-sm">Usuario</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label className="text-white/60 text-sm">Contraseña</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 text-white"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              {isLoading ? 'Verificando...' : 'Entrar'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}