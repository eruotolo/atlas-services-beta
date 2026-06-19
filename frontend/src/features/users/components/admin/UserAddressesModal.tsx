'use client';

import { useEffect, useState } from 'react';
import Modal from '@/shared/components/admin/Modal';
import { Btn } from '@/shared/components/hireeo';
import { Plus, Edit2, Trash2, MapPin } from '@/shared/components/icons';
import { notify } from '@/shared/lib/notify';
import {
    getUserAddresses,
    deleteUserAddress,
    type UserAddress,
} from '../../actions/addresses';
import AddressForm from './AddressForm';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
}

export default function UserAddressesModal({ isOpen, onClose, userId, userName }: Props) {
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);

    async function loadAddresses() {
        setIsLoading(true);
        const data = await getUserAddresses(userId);
        setAddresses(data);
        setIsLoading(false);
    }

    useEffect(() => {
        if (isOpen) {
            loadAddresses();
            setIsFormOpen(false);
            setSelectedAddress(null);
        }
    }, [isOpen, userId]);

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

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Direcciones de ${userName}`}
        >
            {!isFormOpen ? (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Btn type="button" onClick={handleAdd} variant="primary">
                            <Plus size={18} /> Nueva Dirección
                        </Btn>
                    </div>

                    {isLoading ? (
                        <div className="py-8 text-center text-sub">Cargando direcciones...</div>
                    ) : addresses.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-line p-8 text-center text-sub">
                            Este usuario no tiene direcciones registradas.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className="flex items-start justify-between rounded-xl border border-line bg-bg p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex-shrink-0 text-brand">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-ink">
                                                    {address.alias || 'Sin Alias'}
                                                </h4>
                                                {address.isDefault && (
                                                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand uppercase">
                                                        Predeterminada
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 text-sm text-sub">
                                                {address.street} {address.number}
                                                {address.apartment ? `, Dpto: ${address.apartment}` : ''}
                                            </p>
                                            <p className="text-sm text-sub">
                                                {address.locality?.name}, {address.region?.name}, {address.country?.name}
                                            </p>
                                            {address.reference && (
                                                <p className="mt-2 text-xs italic text-sub">
                                                    Ref: {address.reference}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(address)}
                                            className="rounded-lg p-2 text-brand hover:bg-brand/10"
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(address.id)}
                                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <AddressForm
                    userId={userId}
                    address={selectedAddress}
                    onCancel={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        loadAddresses();
                    }}
                />
            )}
        </Modal>
    );
}
