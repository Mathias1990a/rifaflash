import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Sparkles, Trophy, MessageCircle, Zap } from 'lucide-react';
import { Button } from './components/ui/button';
import { RegistrationForm } from './components/RegistrationForm';
import { WinnerAnimation } from './components/WinnerAnimation';
import { UserProfileCard } from './components/UserProfileCard';
import { NumberGrid } from './components/NumberGrid';
import { WinnersList, WinnersCompact } from './components/WinnersList';
import { RoomSelector } from './components/RoomSelector';
import { CasinoBolillero } from './components/CasinoBolillero';
import { BankTransferPayment } from './components/BankTransferPayment';
import { AdminPanel, usePaymentConfig } from './components/AdminPanel';
import { AuthModal, AdminLogin } from './components/AuthModal';
import { Logo } from './components/Logo';
import { useSupabaseUser, useSupabaseRoom, useSupabaseWinners } from './hooks/useSupabase';
import { RoomType, Winner } from './types';
import './index.css';

function App() {
  const { user, isLoading: userLoading, registerUser, logout } = useSupabaseUser();
  const { winners, isLoading: winnersLoading, addWinner } = useSupabaseWinners();
  
  const [selectedRoom, setSelectedRoom] = useState<RoomType>('standard');
  const [showRegistration, setShowRegistration] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [showBankPayment, setShowBankPayment] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const paymentConfig = usePaymentConfig();
  const [currentWinner, setCurrentWinner] = useState<Winner | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  const room = useSupabaseRoom(selectedRoom);

  useEffect(() => {
    if (room.isComplete && !room.isLoading && !currentWinner) {
      handleRaffleComplete();
    }
  }, [room.isComplete, room.isLoading]);

  const handleRaffleComplete = async () => {
    const winnerNumber = await room.selectWinner();
    if (winnerNumber?.owner) {
      const winnerData: Winner = {
        id: Date.now().toString(),
        roomType: selectedRoom,
        roomName: room.roomConfig.name,
        number: winnerNumber.number,
        playerName: winnerNumber.owner.fullName,
        playerDNI: winnerNumber.owner.dni,
        prize: room.roomConfig.prize,
        date: new Date().toISOString(),
        timestamp: Date.now()
      };
      
      setCurrentWinner(winnerData);
      await addWinner(winnerData);
      
      setTimeout(() => {
        setShowWinner(true);
      }, 1000);
    }
  };

  const handleProfileSubmit = async (newProfile: any) => {
    await registerUser(newProfile);
    setShowRegistration(false);
  };

  const handleRouletteSelect = (number: number) => {
    setSelectedNumber(number);
    setShowBankPayment(true);
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setIsAdminPanelOpen(true);
  };

  const occupiedCounts = {
    standard: room.occupiedCount,
    premium: 0,
    vip: 0
  };

  if (userLoading || room.isLoading || winnersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #6366f1 50%, #3b82f6 100%)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Zap className="w-8 h-8 text-yellow-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen text-white overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #0f0518 0%, #1a0a3e 50%, #0f0518 100%)' }}>
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[180px]" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[180px]" />
        </div>

        <header className="relative z-10 border-b border-white/10" style={{ background: 'rgba(15, 5, 24, 0.8)', backdropFilter: 'blur(20px)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-18 py-3">
              <Logo size="md" showText={true} />
              
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => isAdmin ? setIsAdminPanelOpen(true) : setShowAdminLogin(true)}
                  className="text-xs text-white/30 hover:text-white/60 px-2 py-1 rounded border border-white/10"
                >
                  {isAdmin ? 'Panel Admin' : 'Admin'}
                </button>
                
                {user ? (
                  <>
                    <span className="text-sm text-white/60">Hola, {user.fullName?.split(' ')[0] || 'Usuario'}</span>
                    <Button variant="ghost" size="sm" onClick={logout} className="text-white/60 hover:text-white">Cerrar sesión</Button>
                  </>
                ) : (
                  <Button onClick={() => setShowRegistration(true)} className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold">
                    <User className="w-4 h-4 mr-2" />Entrar
                  </Button>
                )}
              </div>

              <button className="md:hidden p-2 rounded-lg hover:bg-white/10" onClick={() => setShowMobileMenu(!showMobileMenu)}>
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <WinnersCompact winners={winners.slice(0, 5)} />
          </div>

          <div className="mb-8">
            <RoomSelector 
              selectedRoom={selectedRoom} 
              onSelectRoom={setSelectedRoom}
              occupiedCounts={occupiedCounts}
            />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl p-6 border-2 text-center"
            style={{ 
              background: `linear-gradient(135deg, ${room.roomConfig.color}30 0%, ${room.roomConfig.color}10 100%)`,
              borderColor: `${room.roomConfig.color}50`
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="w-8 h-8" style={{ color: room.roomConfig.color }} />
              <span className="text-2xl font-display" style={{ color: room.roomConfig.color }}>
                {room.roomConfig.name}
              </span>
            </div>
            <p className="text-white/70">
              {room.roomConfig.maxPlayers} números • ${room.roomConfig.price.toLocaleString()} c/u • 
              <span className="text-yellow-400 font-bold"> ${room.roomConfig.prize.toLocaleString()}</span> en premios
            </p>
          </motion.div>

          <div className="mb-8">
            <CasinoBolillero
              availableNumbers={room.numbers.filter(n => n.status === 'available').map(n => n.number)}
              totalNumbers={room.roomConfig.maxPlayers}
              onNumberSelected={handleRouletteSelect}
              roomColor={room.roomConfig.color}
              roomName={room.roomConfig.name}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <NumberGrid
                numbers={room.numbers}
                onSelectNumber={() => {}}
                occupiedCount={room.occupiedCount}
                reservedCount={0}
                progress={room.progress}
                isComplete={room.isComplete}
                roomColor={room.roomConfig.color}
              />
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {user ? (
                  <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <UserProfileCard
                      profile={user}
                      onEdit={() => setShowRegistration(true)}
                      onLogout={logout}
                      userNumbers={[]}
                      roomConfig={room.roomConfig}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="cta" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl p-6 border-2 border-violet-500/30" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)' }}>
                    <div className="text-center space-y-4">
                      <Sparkles className="w-10 h-10 text-yellow-400 mx-auto" />
                      <h3 className="text-2xl font-display">¿Querés participar?</h3>
                      <p className="text-white/60">Registrate gratis y comprá tus números</p>
                      <Button onClick={() => setShowRegistration(true)} size="lg" className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold">
                        Crear cuenta
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="rounded-2xl p-6 border border-white/10" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <WinnersList winners={winners} maxDisplay={5} />
              </div>

              <div className="rounded-2xl p-5 border" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-10 h-10 text-blue-400" />
                  <div>
                    <h4 className="font-bold text-white text-lg mb-1">¿Necesitás ayuda?</h4>
                    <p className="text-white/60 mb-3">Contactanos por Telegram</p>
                    <Button variant="outline" size="sm" className="border-blue-400/50 text-blue-400" onClick={() => window.open('https://t.me/rifaflash', '_blank')}>
                      Abrir Telegram
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <AuthModal 
          isOpen={showRegistration} 
          onClose={() => setShowRegistration(false)} 
          onLogin={handleProfileSubmit}
        />

        <AdminLogin
          isOpen={showAdminLogin}
          onClose={() => setShowAdminLogin(false)}
          onLogin={handleAdminLogin}
        />

        {isAdmin && (
          <AdminPanel 
            isOpen={isAdminPanelOpen} 
            onClose={() => setIsAdminPanelOpen(false)} 
          />
        )}

        {showBankPayment && selectedNumber && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-b from-[#1a0a3e] to-[#0f0518] rounded-2xl p-6 max-w-md w-full border border-white/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Pagar Número #{selectedNumber}</h3>
                <button onClick={() => setShowBankPayment(false)} className="text-white/60 hover:text-white">✕</button>
              </div>
              
              <BankTransferPayment
                amount={room.roomConfig.price}
                alias={paymentConfig.alias}
                cbu={paymentConfig.cbu}
                accountName={paymentConfig.accountName}
                bankName={paymentConfig.bankName}
                onPaymentSubmit={(data) => {
                  console.log('Pago enviado:', data);
                  setShowBankPayment(false);
                  alert('¡Datos enviados! Verificaremos tu transferencia.');
                }}
              />
            </motion.div>
          </div>
        )}

        <WinnerAnimation
          isOpen={showWinner}
          onClose={() => setShowWinner(false)}
          winner={currentWinner}
          onReset={() => {
            room.resetRoom();
            setShowWinner(false);
            setCurrentWinner(null);
          }}
        />
      </div>
    </>
  );
}

export default App;