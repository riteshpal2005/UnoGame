import React, { useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Alert,
    Platform,
    StatusBar as RNStatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useGameStore } from '../store/gameStore';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { PlayerHand } from '../components/PlayerHand';
import { UnoCard } from '../components/UnoCard';
import { CardBack } from '../components/CardBack';
import { ColorPickerModal } from '../components/ColorPickerModal';
import { useBotAI } from '../hooks/useBotAI';
import { CardColor } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { THEME, CARD_COLORS } from '../constants/colors';
import { FlyingCard } from '../components/FlyingCard';
import { socketService } from '../utils/socketService';


export default function GameScreen({ navigation, route }: any) {
    const { mode, botCount, playersList, roomCode } = route.params || {};
    const [flyingCards, setFlyingCards] = React.useState<{ id: string, card: any, start: { x: number, y: number } }[]>([]);
    const opponentsRef = React.useRef<{ [key: string]: { x: number, y: number } }>({});

    const isBotMode = mode === 'bot';
    if (isBotMode) { useBotAI(); }

    const discardPileRef = React.useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const handRef = React.useRef<{ x: number, y: number }>({ x: 0, y: 0 });

    const {
        startGame, players, discardPile, currentPlayerIndex, currentColor, isChoosingColor,
        unoCalled, winner, debugWinHand, hasDrawnCard, selectedCardIds,
        toggleCardSelection, restartGame, exitGame, lastAction, myId, syncFromSocket
    } = useGameStore();

    const { mpDrawCard, mpPassTurn, mpSayUno, mpSelectColor, mpPlaySelected } = useMultiplayer(mode, roomCode);

    const humanPlayer = mode === 'bot'
        ? players?.[0]
        : players.find(p => p.id === myId) || players?.[0];

    useEffect(() => {
        if (mode === 'bot') return;

        const socket = socketService.socket;
        if (!socket) return;

        const handleGameUpdate = (serverState: any) => {
            console.log("📥 Game Update Received");
            syncFromSocket(serverState);
        };

        socketService.on('GAME_UPDATE', handleGameUpdate);
        socketService.on('GAME_START', handleGameUpdate);

        return () => {
            socketService.off('GAME_UPDATE');
            socketService.off('GAME_START');
        };
    }, [mode, syncFromSocket]);

    if (!players.length || !discardPile.length) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#e11d48" />
                <Text style={{ color: '#94a3b8', marginTop: 20 }}>Dealing Cards...</Text>
            </View>
        );
    }

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

    const getColorHex = (c: CardColor) => {
        return CARD_COLORS[c as keyof typeof CARD_COLORS] || THEME.card;
    };

    if (!humanPlayer || !discardPile.length) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={THEME.primary} />
                <Text style={{ marginTop: 16, color: THEME.textDim }}>Setting up table...</Text>
            </View>
        );
    }

    const handleUnoButton = () => {
        if (humanPlayer.hand.length === 2 && isMyTurn) {
            mpSayUno(humanPlayer.id);
        }
        else {
            Alert.alert("Callout", "Checking for failures...");
        }
    };

    const getUnoBtnText = () => {
        if (unoCalled) return "SAFE";
        if (humanPlayer.hand.length === 2 && isMyTurn) return "SAY UNO!";
        return "CATCH!";
    };

    const handlePlayWithAnimation = () => {
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

    const isMyTurn = currentPlayerIndex === 0;
    const topCard = discardPile[discardPile.length - 1];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" backgroundColor={THEME.bg} />

            {}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleExit} style={styles.iconBtn}>
                    <MaterialCommunityIcons name="logout" size={20} color={THEME.textDim} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.roomBadge} onPress={copyRoomCode} disabled={isBotMode}>
                    <MaterialCommunityIcons name={isBotMode ? "robot" : "wifi"} size={14} color={THEME.success} />
                    <Text style={styles.roomText}>{isBotMode ? 'Single Player' : roomCode}</Text>
                    {!isBotMode && <MaterialCommunityIcons name="content-copy" size={12} color={THEME.textDim} />}
                </TouchableOpacity>

                {}
                {(mode === 'host' || mode === 'bot') ? (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {}
                        <TouchableOpacity style={styles.iconBtn} onPress={debugWinHand}>
                            <MaterialCommunityIcons name="lightning-bolt" size={20} color="#fbbf24" />
                        </TouchableOpacity>

                        {}
                        <TouchableOpacity style={styles.iconBtn} onPress={restartGame}>
                            <MaterialCommunityIcons name="refresh" size={20} color={THEME.textDim} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ width: 32 }} />
                )}
            </View>

            {}
            <View style={styles.opponentsRow}>
                {players.map((p, index) => {
                    if (p.id === humanPlayer?.id) return null;
                    const isTurn = index === currentPlayerIndex;
                    return (
                        <View key={p.id} style={[styles.opponentContainer, isTurn && styles.activeOpponent]} onLayout={(event) => {
                            const { x, y, width, height } = event.nativeEvent.layout;
                            opponentsRef.current[p.id] = { x: x + width / 2, y: y + 80 };
                        }}>
                            <View style={[styles.avatarCircle, isTurn && { borderColor: THEME.success, borderWidth: 2 }]}>
                                <Text style={styles.avatarText}>{(p.name || 'P').charAt(0)}</Text>
                            </View>
                            <Text style={styles.opponentName} numberOfLines={1}>{p.name || 'Player'}</Text>

                            <View style={styles.cardCountBadge}>
                                <MaterialCommunityIcons name="cards-playing-outline" size={12} color={THEME.textDim} />
                                <Text style={styles.cardCountText}>{p.hand.length}</Text>
                            </View>
                        </View>
                    )
                })}
            </View>

            {}
            <View style={styles.tableArea}>

                {}
                <View style={[styles.colorIndicator, { borderColor: getColorHex(currentColor) }]}>
                    <Text style={[styles.colorText, { color: getColorHex(currentColor) }]}>
                        {currentColor ? currentColor.toUpperCase() : 'ANY'}
                    </Text>
                </View>

                {}
                <View
                    style={styles.discardPileWrapper}
                    onLayout={(event) => {
                        const { x, y, width } = event.nativeEvent.layout;
                        discardPileRef.current = { x: x + width / 2 - 30, y: y + 160 };
                    }}
                >
                    <UnoCard card={topCard} scale={1.3} disabled />
                    {}
                </View>

                {}
                <View style={styles.controlsRow}>
                    {}
                    <TouchableOpacity
                        style={[styles.unoBtn, unoCalled ? styles.unoBtnActive : styles.unoBtnInactive]}
                        disabled={!isMyTurn}
                        onPress={handleUnoButton}
                    >
                        <Text style={styles.unoBtnText}>{unoCalled ? "UNO!" : "UNO"}</Text>
                    </TouchableOpacity>

                    {}
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        {selectedCardIds.length > 0 ? (
                            <TouchableOpacity style={styles.playBtn} onPress={handlePlayWithAnimation}>
                                <Text style={styles.playBtnText}>PLAY ({selectedCardIds.length})</Text>
                                <MaterialCommunityIcons name="arrow-up-bold" size={20} color="white" />
                            </TouchableOpacity>
                        ) : (
                            hasDrawnCard ? (
                                <TouchableOpacity style={styles.passBtn} disabled={!isMyTurn} onPress={mpPassTurn}>
                                    <Text style={styles.btnLabel}>Pass Turn</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.drawBtn} disabled={!isMyTurn} onPress={() => mpDrawCard(humanPlayer.id)}>
                                    <MaterialCommunityIcons name="plus" size={20} color="white" />
                                    <Text style={styles.btnLabel}>Draw Card</Text>
                                </TouchableOpacity>
                            )
                        )}
                    </View>

                    {}
                    <View style={{ width: 50 }} />
                </View>
            </View>

            {}
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

            {}
            <ColorPickerModal visible={isChoosingColor} onSelectColor={mpSelectColor} />

            <Modal visible={!!winner} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.winnerCard}>
                        <View style={styles.trophyCircle}>
                            <MaterialCommunityIcons name="trophy" size={50} color="#fbbf24" />
                        </View>
                        <Text style={styles.winnerText}>GAME OVER</Text>
                        <Text style={styles.winnerName}>{winner?.name} Wins!</Text>

                        <View style={styles.winnerButtons}>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: THEME.card }]} onPress={handleExit}>
                                <Text style={[styles.modalBtnText, { color: THEME.textDim }]}>Exit</Text>
                            </TouchableOpacity>

                            {(mode === 'host' || mode === 'bot') && (
                                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: THEME.success }]} onPress={restartGame}>
                                    <Text style={[styles.modalBtnText, { color: 'white' }]}>Play Again</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>

            {}
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
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg,
        paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 10,
        zIndex: 10
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: THEME.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.border,
    },
    roomBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.input,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    roomText: {
        color: THEME.text,
        fontWeight: 'bold',
        fontSize: 14,
    },

    opponentsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    opponentContainer: {
        alignItems: 'center',
        opacity: 0.6
    },
    activeOpponent: {
        opacity: 1,
        transform: [{ scale: 1.1 }]
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: THEME.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    avatarText: {
        color: THEME.text,
        fontWeight: 'bold',
        fontSize: 18,
    },
    opponentName: {
        fontSize: 11,
        color: THEME.textDim,
        maxWidth: 60,
        textAlign: 'center',
        marginBottom: 2,
    },
    cardCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 4,
    },
    cardCountText: {
        color: THEME.text,
        fontSize: 10,
        fontWeight: 'bold',
    },

    tableArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 20,
    },
    colorIndicator: {
        position: 'absolute',
        top: 10,
        borderWidth: 2,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    colorText: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    discardPileWrapper: {
        marginVertical: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },

    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    unoBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    unoBtnActive: {
        backgroundColor: THEME.primary,
        borderColor: 'white',
    },
    unoBtnInactive: {
        backgroundColor: THEME.card,
        borderColor: THEME.border,
        opacity: 0.5,
    },
    unoBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 10,
    },

    playBtn: {
        backgroundColor: THEME.success,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: THEME.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        elevation: 5,
    },
    playBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    drawBtn: {
        backgroundColor: THEME.secondary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    passBtn: {
        backgroundColor: THEME.warning,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
    },
    btnLabel: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },

    handContainer: {
        height: 140,
        justifyContent: 'flex-end',
        paddingBottom: 10,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    winnerCard: {
        width: '80%',
        backgroundColor: THEME.card,
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.border,
        elevation: 20
    },
    trophyCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.3)',
    },
    winnerText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: THEME.textDim,
        letterSpacing: 2
    },
    winnerName: {
        fontSize: 28,
        fontWeight: '900',
        color: THEME.text,
        marginVertical: 10
    },
    winnerButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginTop: 20,
    },
    modalBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center'
    },
    modalBtnText: {
        fontWeight: 'bold',
        fontSize: 14
    },
    debugBtn: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        padding: 10,
    }
});