import { Head } from '@inertiajs/react';

import { index, update } from '@/routes/users';

import { UserForm } from './create';
import type { ManagedUserFormValue } from './create';

type Props = {
    user: ManagedUserFormValue;
    defaultAvatar: string;
};

export default function EditUser({ user, defaultAvatar }: Props) {
    return (
        <>
            <Head title={`Edit ${user.name}`} />

            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-normal">
                        Edit User
                    </h1>
                </div>

                <UserForm
                    mode="edit"
                    action={update.url(user.id)}
                    user={user}
                    defaultAvatar={defaultAvatar}
                />
            </div>
        </>
    );
}

EditUser.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: index(),
        },
        {
            title: 'Edit User',
            href: index(),
        },
    ],
};
