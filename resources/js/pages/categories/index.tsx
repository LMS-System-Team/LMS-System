import { Head, Link, router } from '@inertiajs/react';
import {
    FolderOpen,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const categoriesPath = '/categories';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    status: 'active' | 'inactive';
    learning_materials_count: number;
    created_at_formatted: string | null;
};

type Filters = {
    search: string;
    status: 'all' | 'active' | 'inactive';
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedCategories = {
    data: Category[];
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
};

type Props = {
    categories: PaginatedCategories;
    filters: Filters;
};

function statusBadge(category: Category) {
    return category.status === 'active' ? (
        <Badge>Active</Badge>
    ) : (
        <Badge variant="secondary">Inactive</Badge>
    );
}

function paginationLabel(label: string) {
    return label.replace('&laquo;', 'Previous').replace('&raquo;', 'Next');
}

export default function CategoriesIndex({ categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState<Filters['status']>(
        filters.status ?? 'all',
    );

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            router.get(
                categoriesPath,
                {
                    search: search || undefined,
                    status: status === 'all' ? undefined : status,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search, status]);

    const destroyCategory = (category: Category) => {
        if (
            !window.confirm(
                `Delete "${category.name}"? Categories with materials cannot be deleted.`,
            )
        ) {
            return;
        }

        router.delete(`${categoriesPath}/${category.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Categories" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-normal">
                            Categories
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Organize the LMS content library.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href={`${categoriesPath}/create`}>
                            <Plus className="size-4" />
                            New category
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative w-full md:max-w-sm">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Filter by name or description..."
                            className="pl-9"
                        />
                    </div>

                    <Select
                        value={status}
                        onValueChange={(value) =>
                            setStatus(value as Filters['status'])
                        }
                    >
                        <SelectTrigger className="w-full md:w-44">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Card className="gap-0 overflow-hidden rounded-lg py-0">
                    <CardHeader className="py-5">
                        <CardTitle>Category list</CardTitle>
                        <CardDescription>
                            Review content groups and their material counts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">
                                        Category
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Materials</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="pr-6 text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            No categories found.
                                        </TableCell>
                                    </TableRow>
                                )}

                                {categories.data.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="pl-6">
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                                                    <FolderOpen className="size-5 text-muted-foreground" />
                                                </span>
                                                <div className="min-w-0">
                                                    <div className="font-medium">
                                                        {category.name}
                                                    </div>
                                                    <div className="truncate text-sm text-muted-foreground">
                                                        {category.description ||
                                                            category.slug}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {statusBadge(category)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {category.learning_materials_count}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {category.created_at_formatted ||
                                                'N/A'}
                                        </TableCell>
                                        <TableCell className="pr-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                        <span className="sr-only">
                                                            Open category
                                                            actions
                                                        </span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`${categoriesPath}/${category.id}/edit`}
                                                        >
                                                            <Pencil className="size-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onSelect={() =>
                                                            destroyCategory(
                                                                category,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="size-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {categories.from ?? 0} to{' '}
                            {categories.to ?? 0} of {categories.total}{' '}
                            categories
                        </p>

                        {categories.links.length > 3 && (
                            <div className="flex flex-wrap gap-2">
                                {categories.links.map((link) =>
                                    link.url ? (
                                        <Button
                                            key={link.label}
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            asChild
                                        >
                                            <Link href={link.url}>
                                                {paginationLabel(link.label)}
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            key={link.label}
                                            variant="outline"
                                            size="sm"
                                            disabled
                                        >
                                            {paginationLabel(link.label)}
                                        </Button>
                                    ),
                                )}
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}

CategoriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: categoriesPath,
        },
    ],
};
