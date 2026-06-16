import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { router } from 'expo-router';

import { Icon } from '@/shared/components/Icon';
import { Colors } from '@/shared/constants/colors';
import { useCountry } from '@/features/country/context/CountryContext';
import {
    detectarServicio,
    type DetectarServicioResult,
} from '@/features/chatbot/actions/detectarServicio';

type Paso = 'inicio' | 'sinProveedores';

interface ChatIAProps {
    readonly bottomOffset?: number;
}

export function ChatIA({ bottomOffset = 16 }: ChatIAProps): React.JSX.Element {
    const { countryCode } = useCountry();
    const [abierto, setAbierto] = useState(false);
    const [paso, setPaso] = useState<Paso>('inicio');
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deteccion, setDeteccion] = useState<DetectarServicioResult | null>(null);

    const reiniciar = (): void => {
        setPaso('inicio');
        setMensaje('');
        setError(null);
        setDeteccion(null);
        setCargando(false);
    };

    const cerrar = (): void => {
        setAbierto(false);
        reiniciar();
    };

    const navegar = (slug: string): void => {
        cerrar();
        router.push(`/(tabs)/services?category=${encodeURIComponent(slug)}` as never);
    };

    const handleEnviar = async (): Promise<void> => {
        if (mensaje.trim().length < 3) return;
        setCargando(true);
        setError(null);

        const result = await detectarServicio(mensaje.trim(), countryCode);
        setCargando(false);

        if (!result.success || result.error != null) {
            setError(result.error ?? 'No pude identificar el servicio. Intentá de nuevo.');
            return;
        }

        setDeteccion(result);

        if (result.sinProveedores === true) {
            setPaso('sinProveedores');
        } else if (result.categoriaSlug != null) {
            navegar(result.categoriaSlug);
        }
    };

    const handleUsarOtros = (): void => {
        if (deteccion?.otrosSlug != null) navegar(deteccion.otrosSlug);
    };

    const handleFallback = (): void => {
        if (deteccion?.categoriaSlug != null) navegar(deteccion.categoriaSlug);
    };

    return (
        <>
            <Pressable
                onPress={() => setAbierto(true)}
                accessibilityLabel="Abrir asistente de Hireeo"
                accessibilityRole="button"
                className="absolute right-4 w-14 h-14 rounded-full bg-primary items-center justify-center"
                style={({ pressed }) => [
                    {
                        bottom: bottomOffset,
                        shadowColor: Colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.35,
                        shadowRadius: 10,
                        elevation: 10,
                    },
                    pressed ? { transform: [{ scale: 0.92 }] } : undefined,
                ]}
            >
                <Icon name="sparkles" size={22} color={Colors.onPrimary} />
            </Pressable>

            <Modal
                visible={abierto}
                transparent
                animationType="slide"
                onRequestClose={cerrar}
                statusBarTranslucent
            >
                <Pressable
                    className="flex-1 justify-end"
                    style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                    onPress={cerrar}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <Pressable
                            onPress={() => {}}
                            className="mx-3 mb-6 rounded-3xl bg-surface p-5"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: -2 },
                                shadowOpacity: 0.12,
                                shadowRadius: 16,
                                elevation: 12,
                            }}
                        >
                            <View className="flex-row justify-between items-center mb-4">
                                <View className="flex-row items-center gap-2">
                                    <Icon name="sparkles" size={18} color={Colors.primary} />
                                    <Text className="text-lg font-bold text-primary">
                                        Asistente Hireeo
                                    </Text>
                                </View>
                                <Pressable
                                    onPress={cerrar}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    accessibilityLabel="Cerrar"
                                    accessibilityRole="button"
                                >
                                    <Icon name="x" size={20} color={Colors.onSurfaceVariant} />
                                </Pressable>
                            </View>

                            {paso === 'inicio' && (
                                <View className="gap-3">
                                    <Text className="text-sm text-onSurfaceVariant">
                                        ¿Qué necesitás? Describilo con tus palabras.
                                    </Text>
                                    <TextInput
                                        value={mensaje}
                                        onChangeText={setMensaje}
                                        placeholder="Ej: se me rompió una cañería..."
                                        placeholderTextColor={Colors.onSurfaceVariant}
                                        multiline
                                        numberOfLines={3}
                                        maxLength={300}
                                        returnKeyType="send"
                                        onSubmitEditing={() => { void handleEnviar(); }}
                                        className="border border-outlineVariant rounded-xl px-4 py-3 text-sm text-onSurface"
                                        style={{ minHeight: 72, textAlignVertical: 'top' }}
                                    />
                                    {error != null && (
                                        <Text className="text-xs text-error">{error}</Text>
                                    )}
                                    <Pressable
                                        onPress={() => { void handleEnviar(); }}
                                        disabled={cargando || mensaje.trim().length < 3}
                                        className="bg-primary rounded-xl py-3 items-center justify-center flex-row gap-2"
                                        style={({ pressed }) =>
                                            pressed || mensaje.trim().length < 3
                                                ? { opacity: 0.6 }
                                                : undefined
                                        }
                                    >
                                        {cargando ? (
                                            <ActivityIndicator size="small" color={Colors.onPrimary} />
                                        ) : (
                                            <>
                                                <Icon name="search" size={16} color={Colors.onPrimary} />
                                                <Text className="text-white font-semibold text-sm">
                                                    Buscar profesional
                                                </Text>
                                            </>
                                        )}
                                    </Pressable>
                                </View>
                            )}

                            {paso === 'sinProveedores' && (
                                <View className="gap-3">
                                    <View className="items-center gap-2 py-3">
                                        <Icon name="location-off" size={32} color={Colors.error} />
                                        <Text className="text-base font-semibold text-onSurface text-center">
                                            Sin profesionales disponibles
                                        </Text>
                                        <Text className="text-sm text-onSurfaceVariant text-center leading-5">
                                            {deteccion?.categoriaNombre != null
                                                ? `No encontramos ${deteccion.categoriaNombre.toLowerCase()} en tu zona aún.`
                                                : 'No encontramos profesionales en tu zona aún.'}
                                        </Text>
                                    </View>
                                    {deteccion?.otrosNombre != null && (
                                        <Pressable
                                            onPress={handleUsarOtros}
                                            className="bg-primary rounded-xl py-3 items-center"
                                            style={({ pressed }) =>
                                                pressed ? { opacity: 0.8 } : undefined
                                            }
                                        >
                                            <Text className="text-white font-semibold text-sm">
                                                {`Buscar en ${deteccion.otrosNombre}`}
                                            </Text>
                                        </Pressable>
                                    )}
                                    <Pressable
                                        onPress={handleFallback}
                                        className="border border-outlineVariant rounded-xl py-3 items-center"
                                        style={({ pressed }) =>
                                            pressed ? { opacity: 0.7 } : undefined
                                        }
                                    >
                                        <Text className="text-onSurface text-sm font-medium">
                                            Ver resultados igual
                                        </Text>
                                    </Pressable>
                                    <Pressable onPress={reiniciar} className="items-center py-1">
                                        <Text className="text-xs text-onSurfaceVariant underline">
                                            Intentar de nuevo
                                        </Text>
                                    </Pressable>
                                </View>
                            )}
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </>
    );
}
