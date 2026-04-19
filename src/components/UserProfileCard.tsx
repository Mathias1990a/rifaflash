import { motion } from 'framer-motion';
import { 
  User, 
  CreditCard, 
  Phone, 
  FileText,
  LogOut,
  Trophy,
  Ticket,
  Zap,
  Gift,
  Wallet,
  Copy,
  Users
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { UserProfile, RaffleNumber, RoomConfig } from '../types';

interface UserProfileCardProps {
  profile: UserProfile;
  onEdit: () => void;
  onLogout: () => void;
  userNumbers: RaffleNumber[];
  roomConfig: RoomConfig;
}

export function UserProfileCard({ profile, onEdit, onLogout, userNumbers, roomConfig }: UserProfileCardProps) {
  const occupiedCount = userNumbers.filter(n => n.status === 'occupied').length;
  const reservedCount = userNumbers.filter(n => n.status === 'reserved').length;

  const copyReferralCode = () => {
    if (profile.referralCode) {
      navigator.clipboard.writeText(profile.referralCode);
      alert('¡Código copiado! Compartilo con tus amigos.');
    }
  };

  return (
    <Card className="border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-transparent">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center"
            >
              <User className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-lg">{profile.fullName}</CardTitle>
              <p className="text-sm text-white/50">Participante</p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="w-4 h-4 text-white/60" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Saldo de juego */}
        {profile.gameBalance > 0 && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30">
            <div className="flex items-center gap-2 text-yellow-400 text-sm mb-1">
              <Wallet className="w-4 h-4" />
              Saldo para jugar
            </div>
            <p className="text-2xl font-bold text-white">${profile.gameBalance?.toLocaleString()}</p>
            <p className="text-xs text-white/50 mt-1">Solo válido para comprar números</p>
          </div>
        )}

        {/* Código de referido */}
        {profile.referralCode && (
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
              <Gift className="w-4 h-4" />
              Tu código de referido
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-black/30 px-3 py-2 rounded-lg text-lg font-mono text-white">
                {profile.referralCode}
              </code>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={copyReferralCode}
                className="text-green-400 hover:text-green-300"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-white/50 mt-2">
              Compartí este código con tus amigos. Cuando se registren y compren un número, 
              <span className="text-green-400 font-semibold"> vos ganás $3.000</span> para jugar.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
              <FileText className="w-3 h-3" />
              DNI
            </div>
            <p className="text-sm font-medium">{profile.dni}</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
              <Phone className="w-3 h-3" />
              Teléfono
            </div>
            <p className="text-sm font-medium">{profile.phone}</p>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <CreditCard className="w-3 h-3" />
            CVU / Alias
          </div>
          <p className="text-sm font-medium">{profile.cvuAlias}</p>
        </div>

        {/* Sala actual */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/5" style={{ borderColor: `${roomConfig.color}40` }}>
          <div className="flex items-center gap-2 text-xs mb-1" style={{ color: roomConfig.color }}>
            <Zap className="w-3 h-3" />
            Sala Actual
          </div>
          <p className="text-sm font-medium text-white">{roomConfig.name}</p>
          <p className="text-xs text-white/50">${roomConfig.price.toLocaleString()} por número</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-gradient-to-br from-green-500/10 to-transparent rounded-lg p-3 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-400 text-xs mb-1">
              <Trophy className="w-3 h-3" />
              Comprados
            </div>
            <p className="text-2xl font-display text-white">{occupiedCount}</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500/10 to-transparent rounded-lg p-3 border border-yellow-500/20">
            <div className="flex items-center gap-2 text-yellow-400 text-xs mb-1">
              <Zap className="w-3 h-3" />
              Reservados
            </div>
            <p className="text-2xl font-display text-white">{reservedCount}</p>
          </div>
        </div>

        {userNumbers.length > 0 && (
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Ticket className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium">Tus Números ({userNumbers.length})</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {userNumbers.map((num, idx) => (
                <motion.div
                  key={num.number}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold
                    ${num.status === 'occupied' 
                      ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' 
                      : 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-black'}
                  `}
                >
                  {num.number.toString().padStart(2, '0')}
                </motion.div>
              ))}
            </div>          
          </div>
        )}
        
        <Button variant="outline" onClick={onEdit} className="w-full border-white/20">
          Editar Perfil
        </Button>
      </CardContent>
    </Card>
  );
}