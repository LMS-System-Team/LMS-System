import { Head } from '@inertiajs/react';

import { CategoryForm } from './create';
import type { CategoryFormValue } from './create';

const categoriesPath = '/categories';

type Props = {
    category: CategoryFormValue;
};

export default function EditCategory({ category }: Props) {
    return (
        <>
            <Head title={`Edit ${category.name}`} />

            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-normal">
                        Edit Category
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Update how this learning category appears in the LMS.
                    </p>
                </div>

                <CategoryForm
                    mode="edit"
                    action={`${categoriesPath}/${category.id}`}
                    category={category}
                />
            </div>
        </>
    );
}

EditCategory.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: categoriesPath,
        },
        {
            title: 'Edit Category',
            href: categoriesPath,
        },
    ],
};
