import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';

import { useGameStore } from '../features/game/store';
import { useMultiplayer } from '../features/multiplayer/hooks/useMultiplayer';
import { useBotAI } from '../features/bot/hooks/useBotAI';
import { useGameSocket } from '../features/multiplayer/hooks/useGameSocket';
import { socketService } from '../features/multiplayer/utils/socketService';
import { THEME } from '../constants/colors';

import { GameHeader } from '../features/game/components/GameHeader';
import { OpponentRow } from '../features/game/components/OpponentRow';
import { TableCenter } from '../features/game/components/TableCenter';
import { GameControls } from '../features/game/components/GameControls';
import { PlayerHand } from '../features/game/components/PlayerHand';
import { ColorPickerModal } from '../features/game/components/ColorPickerModal';
import { FlyingCard } from '../features/game/components/FlyingCard';
import { GameOverModal } from '../features/game/components/GameOverModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function GameScreen({ navigation, route }: any) {
    const { mode, botCount, playersList, roomCode } = route.params || {};
    const [flyingCards, setFlyingCards] = React.useState<{ id: string, card: any, start: { x: number, y: number } }[]>([]);
    
    const opponentsRef = React.useRef<{ [key: string]: { x: number, y: number } }>({});
    const discardPileRef = React.useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const handRef = React.useRef<{ x: number, y: number }>({ x: 0, y: 0 });

    const isBotMode = mode === 'bot';
    if (isBotMode) { useBotAI(); }

    const {
        startGame, players, discardPile, currentPlayerIndex, currentColor, isChoosingColor,
        unoCalled, winner, debugWinHand, hasDrawnCard, selectedCardIds,
        toggleCardSelection, restartGame, exitGame, myId, syncFromSocket
    } = useGameStore();

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
        navigation.reset({ index: 0, routes: [{ name: 'Lobby' }] });
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
            <View style={{ flex: 1, backgroundColor: THEME.bg, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={THEME.primary} />
                <Text style={{ color: THEME.textDim, marginTop: 20 }}>Dealing Cards...</Text>
            </View>
        );
    }

    const isMyTurn = currentPlayerIndex === 0;
    const topCard = discardPile[discardPile.length - 1];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" backgroundColor={THEME.bg} />

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
                style={styles.handContainer}
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
                <TouchableOpacity style={styles.debugBtn} onPress={debugWinHand}>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg,
        paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
    },
    handContainer: {
        height: 140,
        justifyContent: 'flex-end',
        paddingBottom: 10,
    },
    debugBtn: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        padding: 10,
    }
});