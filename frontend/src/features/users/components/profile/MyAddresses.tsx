'use client';

import { useEffect, useState } from 'react';
import { Btn, Icon, Mono } from '@/shared/components/hireeo';
import { notify } from '@/shared/lib/notify';
import {
    getUserAddresses,
    deleteUserAddress,
    type UserAddress,
} from '@/features/users/actions/addresses';
import AddressForm from '@/features/users/components/admin/AddressForm';

interface Props {
    userId: string;
}

export default function MyAddresses({ userId }: Props) {
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);

    async function loadAddresses() {
        setIsLoading(true);
        const data = await getUserAddresses(userId);
        setAddresses(data);
        setIsLoading(false);
    }

    useEffect(() => {
        loadAddresses();
    }, [userId]);

    async function handleDelete(addressId: string) {
        if (!confirm('¿Seguro que deseas eliminar esta dirección?')) return;
        const result = await deleteUserAddress(userId, addressId);
        if (result.error) {
            notify.error({ title: 'Error', description: result.error });
        } else {
            notify.success({ title: 'Dirección eliminada' });
            loadAddresses();
        }
    }

    function handleEdit(address: UserAddress) {
        setSelectedAddress(address);
        setIsFormOpen(true);
    }

    function handleAdd() {
        setSelectedAddress(null);
        setIsFormOpen(true);
    }

    if (isFormOpen) {
        return (
            <div className="rounded-xl border border-line bg-bg p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
                    <h2 className="text-xl font-bold text-ink">
                        {selectedAddress ? 'Editar Dirección' : 'Nueva Dirección'}
                    </h2>
                    <Btn variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
                        Volver
                    </Btn>
                </div>
                <AddressForm
                    userId={userId}
                    address={selectedAddress}
                    onCancel={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        loadAddresses();
                    }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-end pb-4">
                <Btn variant="primary" onClick={handleAdd} icon="plus">
                    Agregar Dirección
                </Btn>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent"></div>
                </div>
            ) : addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-bg p-12 text-center">
                    <div className="mb-3 rounded-full bg-tint p-3 text-brand">
                        <Icon name="pin" size={24} />
                    </div>
                    <h3 className="font-semibold text-ink">Aún no tienes direcciones</h3>
                    <p className="mt-1 text-sm text-sub max-w-sm">
                        Agrega al menos una dirección para que podamos enviarte a los mejores profesionales a tu ubicación.
                    </p>
                    <Btn variant="secondary" className="mt-4" onClick={handleAdd}>
                        Agregar mi primera dirección
                    </Btn>
                </div>
            ) : (
                <div className="grid gap-4">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className="flex items-start justify-between rounded-xl border border-line bg-bg p-5 shadow-sm transition-all hover:border-ink/20"
                        >
                            <div className="flex items-start gap-4">
                                <div className="mt-1 rounded-full bg-tint p-2 text-brand">
                                    <Icon name="pin" size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-[15px] font-bold text-ink">
                                            {address.alias || 'Dirección'}
                                        </h4>
                                        {address.isDefault && (
                                            <Mono className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">
                                                PREDETERMINADA
                                            </Mono>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm font-medium text-ink">
                                        {address.street} {address.number}
                                        {address.apartment ? `, Dpto: ${address.apartment}` : ''}
                                    </p>
                                    <p className="text-sm text-sub">
                                        {address.locality?.name}, {address.region?.name}, {address.country?.name}
                                    </p>
                                    {address.reference && (
                                        <p className="mt-2 text-[13px] italic text-sub">
                                            Ref: {address.reference}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Btn variant="secondary" size="sm" onClick={() => handleEdit(address)} icon="edit">
                                    Editar
                                </Btn>
                                <Btn variant="ghost" size="sm" onClick={() => handleDelete(address.id)} icon="trash" className="text-danger hover:bg-danger-soft hover:text-danger">
                                    Eliminar
                                </Btn>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
