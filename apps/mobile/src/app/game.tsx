import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';

import { useGameStore } from '../features/game/store';
import { useMultiplayer } from '../features/multiplayer/hooks/useMultiplayer';
import { useBotAI } from '../features/bot/hooks/useBotAI';
import { useGameSocket } from '../features/multiplayer/hooks/useGameSocket';
import { socketService } from '../features/multiplayer/utils/socketService';


import { GameHeader } from '../features/game/components/GameHeader';
import { OpponentRow } from '../features/game/components/OpponentRow';
import { TableCenter } from '../features/game/components/TableCenter';
import { GameControls } from '../features/game/components/GameControls';
import { PlayerHand } from '../features/game/components/PlayerHand';
import { ColorPickerModal } from '../features/game/components/ColorPickerModal';
import { FlyingCard } from '../features/game/components/FlyingCard';
import { GameOverModal } from '../features/game/components/GameOverModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Animated } from 'react-native';

export default function GameScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const mode = params.mode as string;
    const botCount = params.botCount;
    const roomCode = params.roomCode as string;
    const [flyingCards, setFlyingCards] = React.useState<{ id: string, card: any, start: { x: number, y: number } }[]>([]);
    
    const opponentsRef = React.useRef<{ [key: string]: { x: number, y: number } }>({});
    const discardPileRef = React.useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const handRef = React.useRef<{ x: number, y: number }>({ x: 0, y: 0 });

    const isBotMode = mode === 'bot';
    if (isBotMode) { useBotAI(); }

    const {
        startGame, players, discardPile, currentPlayerIndex, currentColor, isChoosingColor,
        unoCalled, winner, debugWinHand, hasDrawnCard, selectedCardIds,
        toggleCardSelection, restartGame, exitGame, myId, syncFromSocket,
        gameStatus,
        setGameStatus
    } = useGameStore();

    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    // Trigger Dealing Animation logic
    useEffect(() => {
        if (isBotMode && gameStatus === 'dealing') {
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
            const timer = setTimeout(() => {
                setGameStatus('playing');
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start();
        }
    }, [isBotMode, gameStatus]);

    const { mpDrawCard, mpPassTurn, mpSayUno, mpSelectColor, mpPlaySelected } = useMultiplayer(mode, roomCode);

    const humanPlayer = mode === 'bot'
        ? players?.[0]
        : players.find(p => p.id === myId) || players?.[0];

    useGameSocket(mode, syncFromSocket);

    const copyRoomCode = async () => {
        if (roomCode) {
            await Clipboard.setStringAsync(roomCode);
            Alert.alert("Copied!", `Room Code ${roomCode} copied.`);
        }
    };

    const handleExit = () => {
        exitGame();
        router.replace('/');
    };

    const handleUnoButton = () => {
        if (humanPlayer && humanPlayer.hand.length === 2 && isMyTurn) {
            mpSayUno(humanPlayer.id);
        } else {
            Alert.alert("Callout", "Checking for failures...");
        }
    };

    const handlePlayWithAnimation = () => {
        if (!humanPlayer) return;
        const cardsToPlay = humanPlayer.hand.filter(c => selectedCardIds.includes(c.id));

        if (cardsToPlay.length === 0) return;

        const newFliers = cardsToPlay.map((card, index) => ({
            id: `fly-${card.id}-${Math.random()}`,
            card: card,
            start: {
                x: handRef.current.x + (index * 30),
                y: handRef.current.y
            }
        }));

        setFlyingCards(prev => [...prev, ...newFliers]);
        mpPlaySelected();
    };

    if (!players.length || !discardPile.length || !humanPlayer) {
        return (
            <View className="flex-1 bg-background justify-center items-center">
                <ActivityIndicator size="large" color="#EF4444" />
                <Text className="text-text-secondary mt-5">Dealing Cards...</Text>
            </View>
        );
    }

    const isMyTurn = currentPlayerIndex === 0;
    const topCard = discardPile[discardPile.length - 1];

    return (
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar style="light" />

            {gameStatus === 'dealing' && (
                <Animated.View 
                    style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim, backgroundColor: 'rgba(15, 23, 42, 0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 50 }]}
                >
                    <ActivityIndicator size="large" color="#F8FAFC" style={{ marginBottom: 16 }} />
                    <Text style={{ color: '#F8FAFC', fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 }}>
                        Dealing Hands...
                    </Text>
                </Animated.View>
            )}

            <GameHeader 
                mode={mode}
                roomCode={roomCode}
                isBotMode={isBotMode}
                onExit={handleExit}
                onCopyRoomCode={copyRoomCode}
                onDebugWinHand={debugWinHand}
                onRestartGame={restartGame}
            />

            <OpponentRow 
                players={players}
                humanPlayerId={humanPlayer.id}
                currentPlayerIndex={currentPlayerIndex}
                onLayoutOpponent={(id, x, y) => { opponentsRef.current[id] = { x, y } }}
            />

            <TableCenter 
                currentColor={currentColor}
                topCard={topCard}
                onLayoutDiscardPile={(x, y) => { discardPileRef.current = { x, y } }}
            >
                <GameControls 
                    unoCalled={unoCalled}
                    isMyTurn={isMyTurn}
                    onUnoButton={handleUnoButton}
                    selectedCardIds={selectedCardIds}
                    onPlay={handlePlayWithAnimation}
                    hasDrawnCard={hasDrawnCard}
                    onPassTurn={mpPassTurn}
                    onDrawCard={() => mpDrawCard(humanPlayer.id)}
                />
            </TableCenter>

            <View
                className="h-[140px] justify-end pb-3"
                onLayout={(event) => {
                    const { x, y } = event.nativeEvent.layout;
                    handRef.current = { x: x + 20, y: y + 480 };
                }}
            >
                <PlayerHand
                    cards={humanPlayer.hand}
                    isMyTurn={isMyTurn}
                    selectedCardIds={selectedCardIds}
                    onCardPress={toggleCardSelection}
                />
            </View>

            <ColorPickerModal visible={isChoosingColor} onSelectColor={mpSelectColor} />

            <GameOverModal 
                winner={winner as any}
                mode={mode}
                onExit={handleExit}
                onRestartGame={restartGame}
            />

            {(mode === 'host' || mode === 'bot') && (
                <TouchableOpacity className="absolute bottom-3 right-3 p-3" onPress={debugWinHand}>
                    <MaterialCommunityIcons name="lightning-bolt" size={16} color="rgba(255,255,255,0.2)" />
                </TouchableOpacity>
            )}

            {flyingCards.map((flier) => (
                <FlyingCard
                    key={flier.id}
                    card={flier.card}
                    startPos={flier.start}
                    endPos={discardPileRef.current}
                    onAnimationComplete={() => {
                        setFlyingCards(prev => prev.filter(p => p.id !== flier.id));
                    }}
                />
            ))}

        </SafeAreaView>
    );
}