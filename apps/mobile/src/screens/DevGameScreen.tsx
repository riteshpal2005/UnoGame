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
    StatusBar as RNStatusBar,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useGameStore } from '../store/gameStore';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { PlayerHand } from '../components/PlayerHand';
import { UnoCard } from '../components/UnoCard';
import { ColorPickerModal } from '../components/ColorPickerModal';
import { useBotAI } from '../hooks/useBotAI';
import { CardColor } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { THEME, CARD_COLORS } from '../constants/colors';
import { FlyingCard } from '../components/FlyingCard';
import { socketService } from '../utils/socketService';

const { width, height } = Dimensions.get('window');
const BASE_W = 375;
const BASE_H = 812;

const s = (size: number) => (width / BASE_W) * size;
const v = (size: number) => (height / BASE_H) * size;
const ms = (size: number, factor = 0.5) => size + (s(size) - size) * factor;


export default function DevGameScreen({ navigation, route }: any) {
    const { mode, botCount, roomCode } = route.params || {};
    const [flyingCards, setFlyingCards] = React.useState<{ id: string, card: any, start: { x: number, y: number } }[]>([]);
    
    const discardPileViewRef = React.useRef<View>(null);
    const handViewRef = React.useRef<View>(null);
    const discardPilePos = React.useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const handPos = React.useRef<{ x: number, y: number }>({ x: 0, y: 0 });

    const isBotMode = mode === 'bot';
    if (isBotMode) { useBotAI(); }

    const {
        startGame, players, discardPile, currentPlayerIndex, currentColor, isChoosingColor,
        unoCalled, winner, debugWinHand, hasDrawnCard, selectedCardIds,
        toggleCardSelection, restartGame, exitGame, myId, syncFromSocket
    } = useGameStore();

    const [isInitializing, setIsInitializing] = React.useState(true);

    const { mpDrawCard, mpPassTurn, mpSayUno, mpSelectColor, mpPlaySelected } = useMultiplayer(mode, roomCode);

    const humanPlayer = mode === 'bot'
        ? players?.[0]
        : players.find(p => p.id === myId) || players?.[0];

    useEffect(() => {
        let mounted = true;

        const initGame = async () => {
            if (mode === 'bot') {
                console.log("🤖 Initializing Bot Game...");
                startGame(botCount || 1);
                
                setTimeout(() => {
                    if (mounted) setIsInitializing(false);
                }, 500);
            } 
            else {
                const socket = socketService.socket;
                if (!socket) return;

                const handleGameUpdate = (serverState: any) => {
                    console.log("📥 Syncing State...");
                    syncFromSocket(serverState);
                    if (isInitializing) setIsInitializing(false);
                };

                socket.on('GAME_UPDATE', handleGameUpdate);
                
                
                if (!players.length) {
                    console.log("📤 Requesting State for", roomCode);
                    socket.emit('REQUEST_GAME_STATE', roomCode);
                } else {
                    setIsInitializing(false);
                }

                return () => {
                    socket.off('GAME_UPDATE', handleGameUpdate);
                };
            }
            
        };

        initGame();

        return () => { mounted = false; };
    }, [mode, botCount]);

    const updateLayouts = () => {
        discardPileViewRef.current?.measure((x, y, w, h, pageX, pageY) => {
            discardPilePos.current = { x: pageX + w / 2 - s(30), y: pageY };
        });
        handViewRef.current?.measure((x, y, w, h, pageX, pageY) => {
            handPos.current = { x: pageX + s(20), y: pageY };
        });
    };

    const hasData = players.length > 0 && discardPile.length > 0;
    if (isInitializing || !hasData) {
         return (
            <View style={{ flex: 1, backgroundColor: THEME.bg, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={THEME.primary} />
                <Text style={{ color: THEME.textDim, marginTop: v(20) }}>{isInitializing ? "Setting up table..." : "Waiting for players..."}</Text>
                {!isInitializing && mode === 'bot' && (
                    <TouchableOpacity onPress={() => startGame(botCount||1)} style={{marginTop: v(20), padding: s(10), backgroundColor: THEME.card, borderRadius: 8}}>
                        <Text style={{color:'white'}}>Retry Deal</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }


    if (!humanPlayer) return null;

    const copyRoomCode = async () => {
        if (roomCode) {
            await Clipboard.setStringAsync(roomCode);
            Alert.alert("Copied!", `Room Code ${roomCode} copied.`);
        }
    };

    const handleExit = () => {
        exitGame();
        navigation.reset({ index: 0, routes: [{ name: 'DevLobby' }] });
    };

    const getColorHex = (c: CardColor) => {
        return CARD_COLORS[c as keyof typeof CARD_COLORS] || THEME.card;
    };

    const handleUnoButton = () => {
        if (humanPlayer.hand.length === 2 && isMyTurn) {
            mpSayUno(humanPlayer.id);
        } else {
            Alert.alert("Callout", "Checking for failures...");
        }
    };

    const handlePlayWithAnimation = () => {
        const cardsToPlay = humanPlayer.hand.filter(c => selectedCardIds.includes(c.id));
        if (cardsToPlay.length === 0) return;
        const newFliers = cardsToPlay.map((card, index) => ({
            id: `fly-${card.id}-${Math.random()}`,
            card: card,
            start: { x: handPos.current.x + (index * s(35)), y: handPos.current.y }
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
                    <MaterialCommunityIcons name="logout" size={s(20)} color={THEME.textDim} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.roomBadge} onPress={copyRoomCode} disabled={isBotMode}>
                    <MaterialCommunityIcons name={isBotMode ? "robot" : "wifi"} size={s(14)} color={THEME.success} />
                    <Text style={styles.roomText}>{isBotMode ? 'Single Player' : roomCode}</Text>
                    {!isBotMode && <MaterialCommunityIcons name="content-copy" size={s(12)} color={THEME.textDim} />}
                </TouchableOpacity>

                {}
                {(mode === 'host' || mode === 'bot') ? (
                    <View style={{ flexDirection: 'row', gap: s(10) }}>
                        <TouchableOpacity style={styles.iconBtn} onPress={debugWinHand}>
                            <MaterialCommunityIcons name="lightning-bolt" size={s(20)} color="#fbbf24" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn} onPress={restartGame}>
                            <MaterialCommunityIcons name="refresh" size={s(20)} color={THEME.textDim} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ width: s(32) }} />
                )}
            </View>

            {}
            <View style={styles.opponentsRow}>
                {players.map((p, index) => {
                    if (p.id === humanPlayer?.id) return null;
                    const isTurn = index === currentPlayerIndex;
                    return (
                        <View key={p.id} style={[styles.opponentContainer, isTurn && styles.activeOpponent]}>
                            <View style={[styles.avatarCircle, isTurn && { borderColor: THEME.success, borderWidth: 2 }]}>
                                <Text style={styles.avatarText}>{(p.name || 'P').charAt(0)}</Text>
                            </View>
                            <Text style={styles.opponentName} numberOfLines={1}>{p.name || 'Player'}</Text>
                            <View style={styles.cardCountBadge}>
                                <MaterialCommunityIcons name="cards-playing-outline" size={s(12)} color={THEME.textDim} />
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
                    ref={discardPileViewRef}
                    style={styles.discardPileWrapper}
                    onLayout={updateLayouts}
                >
                    <UnoCard card={topCard} scale={height < 700 ? 0.75 : 1.3} disabled />
                </View>

                {}
                <View style={styles.controlsRow}>
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
                                <MaterialCommunityIcons name="arrow-up-bold" size={s(20)} color="white" />
                            </TouchableOpacity>
                        ) : (
                            hasDrawnCard ? (
                                <TouchableOpacity style={styles.passBtn} disabled={!isMyTurn} onPress={mpPassTurn}>
                                    <Text style={styles.btnLabel}>Pass Turn</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.drawBtn} disabled={!isMyTurn} onPress={() => mpDrawCard(humanPlayer.id)}>
                                    <MaterialCommunityIcons name="plus" size={s(20)} color="white" />
                                    <Text style={styles.btnLabel}>Draw Card</Text>
                                </TouchableOpacity>
                            )
                        )}
                    </View>
                    <View style={{ width: s(50) }} />
                </View>
            </View>

            {}
            <View
                ref={handViewRef}
                style={styles.handContainer}
                onLayout={updateLayouts}
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
                            <MaterialCommunityIcons name="trophy" size={s(50)} color="#fbbf24" />
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
            {flyingCards.map((flier) => (
                <FlyingCard
                    key={flier.id}
                    card={flier.card}
                    startPos={flier.start}
                    endPos={discardPilePos.current}
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

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: s(20),
        paddingTop: s(10),
        marginBottom: s(10),
        zIndex: 10
    },
    iconBtn: {
        width: s(40),
        height: s(40),
        borderRadius: s(20),
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
        paddingVertical: s(8),
        paddingHorizontal: s(16),
        borderRadius: s(20),
        gap: s(8),
        borderWidth: 1,
        borderColor: THEME.border,
    },
    roomText: {
        color: THEME.text,
        fontWeight: 'bold',
        fontSize: s(14),
    },

    opponentsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: s(10),
        paddingHorizontal: s(10),
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
        width: s(44),
        height: s(44),
        borderRadius: s(22),
        backgroundColor: THEME.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: s(4),
        borderWidth: 1,
        borderColor: THEME.border,
    },
    avatarText: {
        color: THEME.text,
        fontWeight: 'bold',
        fontSize: s(18),
    },
    opponentName: {
        fontSize: s(11),
        color: THEME.textDim,
        maxWidth: s(60),
        textAlign: 'center',
        marginBottom: s(2),
    },
    cardCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: s(6),
        paddingVertical: s(2),
        borderRadius: s(8),
        gap: s(4),
    },
    cardCountText: {
        color: THEME.text,
        fontSize: s(10),
        fontWeight: 'bold',
    },

    tableArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: s(20),
    },
    colorIndicator: {
        position: 'absolute',
        top: s(10),
        borderWidth: 2,
        paddingHorizontal: s(12),
        paddingVertical: s(4),
        borderRadius: s(12),
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    colorText: {
        fontSize: s(12),
        fontWeight: '900',
        letterSpacing: 1,
    },
    discardPileWrapper: {
        marginVertical: s(20),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: s(10) },
        shadowOpacity: 0.5,
        shadowRadius: s(10),
        elevation: 10,
    },

    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: s(20),
        marginTop: s(20),
    },
    unoBtn: {
        width: s(50),
        height: s(50),
        borderRadius: s(25),
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
        fontSize: s(10),
    },

    playBtn: {
        backgroundColor: THEME.success,
        paddingVertical: s(12),
        paddingHorizontal: s(30),
        borderRadius: s(30),
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(8),
        shadowColor: THEME.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        elevation: 5,
    },
    playBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: s(16),
    },
    drawBtn: {
        backgroundColor: THEME.secondary,
        paddingVertical: s(12),
        paddingHorizontal: s(24),
        borderRadius: s(30),
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(6),
    },
    passBtn: {
        backgroundColor: THEME.warning,
        paddingVertical: s(12),
        paddingHorizontal: s(24),
        borderRadius: s(30),
    },
    btnLabel: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: s(15),
    },

    handContainer: {
        height: s(140),
        justifyContent: 'flex-end',
        paddingBottom: s(10),
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
        borderRadius: s(24),
        padding: s(30),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.border,
        elevation: 20
    },
    trophyCircle: {
        width: s(80),
        height: s(80),
        borderRadius: s(40),
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: s(20),
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.3)',
    },
    winnerText: {
        fontSize: s(14),
        fontWeight: 'bold',
        color: THEME.textDim,
        letterSpacing: 2
    },
    winnerName: {
        fontSize: s(28),
        fontWeight: '900',
        color: THEME.text,
        marginVertical: s(10)
    },
    winnerButtons: {
        flexDirection: 'row',
        gap: s(12),
        width: '100%',
        marginTop: s(20),
    },
    modalBtn: {
        flex: 1,
        padding: s(14),
        borderRadius: s(12),
        alignItems: 'center'
    },
    modalBtnText: {
        fontWeight: 'bold',
        fontSize: s(14)
    },
});