import { Head, Link, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { FormEvent } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

const categoriesPath = '/categories';

export type CategoryFormValue = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    status: 'active' | 'inactive';
    learning_materials_count: number;
};

type CategoryFormData = {
    name: string;
    description: string;
    status: 'active' | 'inactive';
};

type CategoryFormProps = {
    mode: 'create' | 'edit';
    action: string;
    category?: CategoryFormValue;
};

export function CategoryForm({ mode, action, category }: CategoryFormProps) {
    const isEdit = mode === 'edit';
    const { data, setData, errors, processing, post, put } =
        useForm<CategoryFormData>({
            name: category?.name ?? '',
            description: category?.description ?? '',
            status: category?.status ?? 'active',
        });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isEdit) {
            put(action, { preserveScroll: true });

            return;
        }

        post(action, { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <Card className="rounded-lg">
                <CardHeader>
                    <CardTitle>Category details</CardTitle>
                    <CardDescription>
                        Group videos, PDFs, and audiobooks into a learning area.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                placeholder="Grammar basics"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={data.status}
                                onValueChange={(value) =>
                                    setData(
                                        'status',
                                        value as CategoryFormData['status'],
                                    )
                                }
                            >
                                <SelectTrigger id="status" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Inactive
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                name="description"
                                value={data.description}
                                onChange={(event) =>
                                    setData('description', event.target.value)
                                }
                                className="min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Short internal note about this category"
                            />
                            <InputError message={errors.description} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
                <Button variant="outline" asChild>
                    <Link href={categoriesPath}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? <Spinner /> : <Save className="size-4" />}
                    {isEdit ? 'Save category' : 'Create category'}
                </Button>
            </div>
        </form>
    );
}

export default function CreateCategory() {
    return (
        <>
            <Head title="Create Category" />

            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-normal">
                        Create Category
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Add a new content category for learning materials.
                    </p>
                </div>

                <CategoryForm mode="create" action={categoriesPath} />
            </div>
        </>
    );
}

CreateCategory.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: categoriesPath,
        },
        {
            title: 'Create Category',
            href: `${categoriesPath}/create`,
        },
    ],
};
