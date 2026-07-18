import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { ProgramFormDialog } from './program-form-dialog';

type Faculty = {
    id: number;
    code: string;
    name: string;
    programs_count: number;
    courses_count: number;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    faculties: {
        data: Faculty[];
        from: number | null;
        to: number | null;
        total: number;
        links: PaginationLink[];
    };
    facultyOptions: { value: string; label: string }[];
    filters: { search: string };
};

const path = '/academic/programs';

function paginationLabel(label: string) {
    return label.replace('&laquo;', 'Previous').replace('&raquo;', 'Next');
}

export default function ProgramsByFacultyIndex({
    faculties,
    facultyOptions,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [creating, setCreating] = useState(false);

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

    return (
        <>
            <Head title="Programs" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-normal">
                            Programs by Faculty
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Faculty is the category, program is the subcategory,
                            and course is the next level.
                        </p>
                    </div>
                    <Button type="button" onClick={() => setCreating(true)}>
                        <Plus className="size-4" /> New program
                    </Button>
                </div>

                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search faculties or programs..."
                        className="pl-9"
                    />
                </div>

                <Card className="gap-0 overflow-hidden py-0 shadow-none">
                    <CardHeader className="py-5">
                        <CardTitle>Faculty list</CardTitle>
                        <CardDescription>
                            Open a faculty page to see its programs and courses.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Code</TableHead>
                                    <TableHead>Faculty</TableHead>
                                    <TableHead>Programs</TableHead>
                                    <TableHead>Courses</TableHead>
                                    <TableHead className="pr-6 text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {faculties.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            No faculties found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {faculties.data.map((faculty) => (
                                    <TableRow key={faculty.id}>
                                        <TableCell className="pl-6 font-medium">
                                            {faculty.code}
                                        </TableCell>
                                        <TableCell>{faculty.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {faculty.programs_count}{' '}
                                                programs
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {faculty.courses_count} courses
                                        </TableCell>
                                        <TableCell className="pr-6 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`${path}/faculties/${faculty.id}`}
                                                >
                                                    View
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 border-t px-6 py-4 sm:flex-row sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {faculties.from ?? 0} to {faculties.to ?? 0}{' '}
                            of {faculties.total} faculties
                        </p>
                        {faculties.links.length > 3 && (
                            <div className="flex flex-wrap gap-2">
                                {faculties.links.map((link) =>
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

                {creating && (
                    <ProgramFormDialog
                        program={null}
                        facultyOptions={facultyOptions}
                        onClose={() => setCreating(false)}
                    />
                )}
            </div>
        </>
    );
}

ProgramsByFacultyIndex.layout = {
    breadcrumbs: [
        { title: 'Academic Management', href: '/academic/faculties' },
        { title: 'Programs', href: path },
    ],
};
