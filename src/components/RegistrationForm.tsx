import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CreditCard, Phone, FileText, Sparkles, X, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { UserProfile } from '../types';

interface RegistrationFormProps {
  isOpen: boolean;
  onSubmit: (profile: UserProfile & { password: string }) => void;
  onCancel?: () => void;
}

export function RegistrationForm({ isOpen, onSubmit, onCancel }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    dni: '',
    phone: '',
    cvuAlias: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  const formatDNI = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}`;
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    if (cleaned.length <= 10) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserProfile, string>> = {};

    if (!formData.fullName.trim() || formData.fullName.length < 3) {
      newErrors.fullName = 'Ingresa tu nombre completo';
    }

    const dniClean = formData.dni.replace(/\./g, '');
    if (!dniClean || dniClean.length < 7 || dniClean.length > 8) {
      newErrors.dni = 'DNI inválido (7-8 dígitos)';
    }

    const phoneClean = formData.phone.replace(/[\s\-]/g, '');
    if (!phoneClean || phoneClean.length < 10) {
      newErrors.phone = 'Teléfono inválido';
    }

    if (!formData.cvuAlias.trim() || formData.cvuAlias.length < 6) {
      newErrors.cvuAlias = 'CVU o Alias inválido';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        fullName: formData.fullName,
        dni: formData.dni,
        phone: formData.phone,
        cvuAlias: formData.cvuAlias,
        password: formData.password
      });
      setFormData({ fullName: '', dni: '', phone: '', cvuAlias: '', password: '', confirmPassword: '' });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-gradient-to-b from-[#1a0a3e] to-[#0f0518] rounded-2xl border border-violet-500/30 p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-display text-white">Crear Cuenta</h2>
                <p className="text-sm text-white/50">Completá tus datos</p>
              </div>
            </div>
            
            {onCancel && (
              <button
                onClick={onCancel}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2 text-white/80">
                <User className="w-4 h-4 text-violet-400" />
                Nombre Completo
              </Label>
              <Input
                id="fullName"
                placeholder="Juan Pérez"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={errors.fullName ? "border-red-500" : "border-white/10"}
              />
              {errors.fullName && (
                <p className="text-xs text-red-400">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dni" className="flex items-center gap-2 text-white/80">
                <FileText className="w-4 h-4 text-violet-400" />
                DNI
              </Label>
              <Input
                id="dni"
                placeholder="12.345.678"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: formatDNI(e.target.value) })}
                maxLength={10}
                className={errors.dni ? "border-red-500" : "border-white/10"}
              />
              {errors.dni && (
                <p className="text-xs text-red-400">{errors.dni}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2 text-white/80">
                <Phone className="w-4 h-4 text-violet-400" />
                Teléfono
              </Label>
              <Input
                id="phone"
                placeholder="11 2345-6789"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                maxLength={14}
                className={errors.phone ? "border-red-500" : "border-white/10"}
              />
              {errors.phone && (
                <p className="text-xs text-red-400">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvuAlias" className="flex items-center gap-2 text-white/80">
                <CreditCard className="w-4 h-4 text-violet-400" />
                CVU o Alias
              </Label>
              <Input
                id="cvuAlias"
                placeholder="tu.alias.mp"
                value={formData.cvuAlias}
                onChange={(e) => setFormData({ ...formData, cvuAlias: e.target.value.toLowerCase() })}
                className={errors.cvuAlias ? "border-red-500" : "border-white/10"}
              />
              {errors.cvuAlias && (
                <p className="text-xs text-red-400">{errors.cvuAlias}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-white/80">
                <Lock className="w-4 h-4 text-violet-400" />
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={errors.password ? "border-red-500 pr-10" : "border-white/10 pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-white/80">
                <Lock className="w-4 h-4 text-violet-400" />
                Confirmar Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={errors.confirmPassword ? "border-red-500 pr-10" : "border-white/10 pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="pt-4 space-y-3">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-500 hover:to-violet-700"
              >
                Guardar Perfil
              </Button>
              {onCancel && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onCancel} 
                  className="w-full text-white/60"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}