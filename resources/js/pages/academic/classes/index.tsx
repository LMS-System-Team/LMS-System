import { Head, Link, router } from '@inertiajs/react';
import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from 'lucide-react';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Classroom = {
    id: number;
    name: string;
    code: string;
    program: string;
    semester: string;
    academic_year: string;
    status: 'active' | 'inactive';
    subjects_count: number;
    students_count: number;
};

type Props = {
    classes: {
        data: Classroom[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: { search: string };
};

const path = '/academic/classes';

export default function ClassManagementIndex({ classes, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            router.get(
                path,
                { search: search || undefined },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search]);

    const destroyClass = (classroom: Classroom) => {
        if (
            window.confirm(
                `Delete "${classroom.code}"? Its assignments must be removed first.`,
            )
        ) {
            router.delete(`${path}/${classroom.id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Class Management" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-normal">
                            Classes
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage class groups, subject channels, professors,
                            and enrolled students.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={`${path}/create`}>
                            <Plus className="size-4" /> New class
                        </Link>
                    </Button>
                </div>

                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search classes..."
                        className="pl-9"
                    />
                </div>

                <Card className="gap-0 overflow-hidden py-0 shadow-none">
                    <CardHeader className="py-5">
                        <CardTitle>Class list</CardTitle>
                        <CardDescription>
                            Review academic placement and member counts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">
                                        Class
                                    </TableHead>
                                    <TableHead>Program</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Subjects</TableHead>
                                    <TableHead>Students</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="pr-6 text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {classes.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            No classes found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {classes.data.map((classroom) => (
                                    <TableRow key={classroom.id}>
                                        <TableCell className="pl-6">
                                            <p className="font-medium">
                                                {classroom.code}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {classroom.name}
                                            </p>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {classroom.program}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {classroom.semester} ·{' '}
                                            {classroom.academic_year}
                                        </TableCell>
                                        <TableCell>
                                            {classroom.subjects_count}
                                        </TableCell>
                                        <TableCell>
                                            {classroom.students_count}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    classroom.status ===
                                                    'active'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {classroom.status === 'active'
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="pr-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`${path}/${classroom.id}/edit`}
                                                        >
                                                            <Pencil className="size-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onSelect={() =>
                                                            destroyClass(
                                                                classroom,
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
                    <CardFooter className="border-t px-6 py-4 text-sm text-muted-foreground">
                        Showing {classes.from ?? 0} to {classes.to ?? 0} of{' '}
                        {classes.total} classes
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}

ClassManagementIndex.layout = {
    breadcrumbs: [
        { title: 'Academic Management', href: '/academic/faculties' },
        { title: 'Classes', href: path },
    ],
};
