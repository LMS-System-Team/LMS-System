import { Head, Link } from '@inertiajs/react';
import { BookOpen, GraduationCap, MoreHorizontal, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type Classroom = {
    id: number;
    name: string;
    code: string;
    color: string;
    program: string;
    faculty: string;
    semester: string;
    academic_year: string;
    subjects_count: number;
    students_count: number;
};

type Props = {
    classes: Classroom[];
};

const colorStyles: Record<string, string> = {
    violet: 'bg-violet-600 text-white',
    blue: 'bg-blue-600 text-white',
    emerald: 'bg-emerald-600 text-white',
    amber: 'bg-amber-500 text-white',
};

function classroomInitials(classroom: Classroom) {
    return classroom.program
        .split(' ')
        .filter((word) => word.length > 2)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();
}

export default function ClassesIndex({ classes }: Props) {
    return (
        <>
            <Head title="My Classes" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <div className="mb-1 flex items-center gap-2">
                        <GraduationCap className="size-6 text-primary" />
                        <h1 className="text-2xl font-semibold tracking-normal">
                            My Classes
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Open a class to access its subjects, learning content,
                        assignments, and results.
                    </p>
                </div>

                {classes.length === 0 ? (
                    <Card className="border-dashed py-12 text-center shadow-none">
                        <CardContent>
                            <GraduationCap className="mx-auto mb-4 size-10 text-muted-foreground" />
                            <h2 className="font-medium">No classes assigned</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Your classes will appear here after enrollment
                                or teaching assignment.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {classes.map((classroom) => (
                            <Card
                                key={classroom.id}
                                className="group gap-0 overflow-hidden py-0 shadow-none transition-colors hover:border-primary/50"
                            >
                                <CardHeader className="flex-row items-start gap-4 border-b p-5">
                                    <div
                                        className={`flex size-14 shrink-0 items-center justify-center rounded-lg text-lg font-semibold ${colorStyles[classroom.color] ?? colorStyles.violet}`}
                                    >
                                        {classroomInitials(classroom)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <Badge variant="secondary">
                                                {classroom.semester}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="-mt-2 -mr-2 size-8"
                                            >
                                                <MoreHorizontal className="size-4" />
                                                <span className="sr-only">
                                                    Class actions
                                                </span>
                                            </Button>
                                        </div>
                                        <CardTitle className="mt-3 truncate text-base">
                                            <Link
                                                href={`/classes/${classroom.id}`}
                                                className="after:absolute after:inset-0"
                                            >
                                                {classroom.code}
                                            </Link>
                                        </CardTitle>
                                        <CardDescription className="mt-1 line-clamp-2">
                                            {classroom.name}
                                        </CardDescription>
                                    </div>
                                </CardHeader>

                                <CardContent className="relative space-y-4 p-5">
                                    <div>
                                        <p className="truncate text-sm font-medium">
                                            {classroom.program}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {classroom.faculty}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <BookOpen className="size-4" />
                                            {classroom.subjects_count} subjects
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Users className="size-4" />
                                            {classroom.students_count} students
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Academic year {classroom.academic_year}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

ClassesIndex.layout = {
    breadcrumbs: [{ title: 'My Classes', href: '/classes' }],
};
