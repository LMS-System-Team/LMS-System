import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Save, Trash2 } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
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

type Offering = {
    id?: number;
    course_id: string;
    professor_id: string;
    room: string;
};

type Classroom = {
    id: number;
    name: string;
    code: string;
    program_id: string;
    semester_id: string;
    color: string;
    status: string;
    offerings: Offering[];
    student_ids: string[];
};

type Option = { id: number; name: string; code?: string; email?: string };

type Props = {
    classroom: Classroom | null;
    programs: Option[];
    semesters: (Option & { academic_year: string })[];
    courses: (Option & { program_id: number })[];
    professors: Option[];
    students: Option[];
};

type FormData = {
    name: string;
    code: string;
    program_id: string;
    semester_id: string;
    color: string;
    status: string;
    offerings: Offering[];
    student_ids: string[];
};

const path = '/academic/classes';

export default function ClassManagementForm({
    classroom,
    programs,
    semesters,
    courses,
    professors,
    students,
}: Props) {
    const isEdit = classroom !== null;
    const { data, setData, errors, processing, post, put } = useForm<FormData>({
        name: classroom?.name ?? '',
        code: classroom?.code ?? '',
        program_id: classroom?.program_id ?? '',
        semester_id: classroom?.semester_id ?? '',
        color: classroom?.color ?? 'violet',
        status: classroom?.status ?? 'active',
        offerings: classroom?.offerings ?? [],
        student_ids: classroom?.student_ids ?? [],
    });

    const availableCourses = courses.filter(
        (course) => String(course.program_id) === data.program_id,
    );

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isEdit) {
            put(`${path}/${classroom.id}`, { preserveScroll: true });
        } else {
            post(path, { preserveScroll: true });
        }
    };

    const addOffering = () => {
        setData('offerings', [
            ...data.offerings,
            { course_id: '', professor_id: '', room: '' },
        ]);
    };

    const updateOffering = (
        index: number,
        key: keyof Offering,
        value: string,
    ) => {
        setData(
            'offerings',
            data.offerings.map((offering, offeringIndex) =>
                offeringIndex === index
                    ? { ...offering, [key]: value }
                    : offering,
            ),
        );
    };

    const toggleStudent = (studentId: string, checked: boolean) => {
        setData(
            'student_ids',
            checked
                ? [...data.student_ids, studentId]
                : data.student_ids.filter((id) => id !== studentId),
        );
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Class' : 'Create Class'} />
            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-normal">
                        {isEdit ? 'Edit Class' : 'Create Class'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Configure the class, subject channels, professors, and
                        student enrollment.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card className="shadow-none">
                        <CardHeader>
                            <CardTitle>Class details</CardTitle>
                            <CardDescription>
                                Select the program and academic period for this
                                student group.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Class name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    placeholder="Information Technology - Class A"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="code">Class code</Label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(event) =>
                                        setData('code', event.target.value)
                                    }
                                    placeholder="D1IT-D104-A"
                                    required
                                />
                                <InputError message={errors.code} />
                            </div>
                            <SelectField
                                label="Program"
                                value={data.program_id}
                                onChange={(value) =>
                                    setData('program_id', value)
                                }
                                options={programs.map((program) => ({
                                    value: String(program.id),
                                    label: `${program.code} — ${program.name}`,
                                }))}
                                error={errors.program_id}
                            />
                            <SelectField
                                label="Semester"
                                value={data.semester_id}
                                onChange={(value) =>
                                    setData('semester_id', value)
                                }
                                options={semesters.map((semester) => ({
                                    value: String(semester.id),
                                    label: `${semester.name} — ${semester.academic_year}`,
                                }))}
                                error={errors.semester_id}
                            />
                            <SelectField
                                label="Card color"
                                value={data.color}
                                onChange={(value) => setData('color', value)}
                                options={[
                                    { value: 'violet', label: 'Violet' },
                                    { value: 'blue', label: 'Blue' },
                                    { value: 'emerald', label: 'Emerald' },
                                    { value: 'amber', label: 'Amber' },
                                ]}
                                error={errors.color}
                            />
                            <SelectField
                                label="Status"
                                value={data.status}
                                onChange={(value) => setData('status', value)}
                                options={[
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' },
                                ]}
                                error={errors.status}
                            />
                        </CardContent>
                    </Card>

                    <Card className="shadow-none">
                        <CardHeader className="flex-row items-start justify-between gap-4">
                            <div>
                                <CardTitle>Subjects and professors</CardTitle>
                                <CardDescription className="mt-1">
                                    Each subject becomes a channel inside the
                                    class workspace.
                                </CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addOffering}
                                disabled={!data.program_id}
                            >
                                <Plus className="size-4" /> Add subject
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <InputError message={errors.offerings} />
                            {data.offerings.length === 0 && (
                                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                    Select a program, then add subject channels.
                                </div>
                            )}
                            {data.offerings.map((offering, index) => (
                                <div
                                    key={offering.id ?? `new-${index}`}
                                    className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_1fr_180px_auto] md:items-end"
                                >
                                    <SelectField
                                        label="Subject"
                                        value={offering.course_id}
                                        onChange={(value) =>
                                            updateOffering(
                                                index,
                                                'course_id',
                                                value,
                                            )
                                        }
                                        options={availableCourses.map(
                                            (course) => ({
                                                value: String(course.id),
                                                label: `${course.code} — ${course.name}`,
                                            }),
                                        )}
                                    />
                                    <SelectField
                                        label="Professor"
                                        value={
                                            offering.professor_id ||
                                            'unassigned'
                                        }
                                        onChange={(value) =>
                                            updateOffering(
                                                index,
                                                'professor_id',
                                                value === 'unassigned'
                                                    ? ''
                                                    : value,
                                            )
                                        }
                                        options={[
                                            {
                                                value: 'unassigned',
                                                label: 'Not assigned',
                                            },
                                            ...professors.map((professor) => ({
                                                value: String(professor.id),
                                                label: professor.name,
                                            })),
                                        ]}
                                    />
                                    <div className="grid gap-2">
                                        <Label>Room</Label>
                                        <Input
                                            value={offering.room}
                                            onChange={(event) =>
                                                updateOffering(
                                                    index,
                                                    'room',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Lab 304"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            setData(
                                                'offerings',
                                                data.offerings.filter(
                                                    (_, itemIndex) =>
                                                        itemIndex !== index,
                                                ),
                                            )
                                        }
                                    >
                                        <Trash2 className="size-4 text-destructive" />
                                        <span className="sr-only">
                                            Remove subject
                                        </span>
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="shadow-none">
                        <CardHeader>
                            <CardTitle>Student enrollment</CardTitle>
                            <CardDescription>
                                Select students who should see this class in My
                                Classes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {students.map((student) => {
                                const studentId = String(student.id);

                                return (
                                    <label
                                        key={student.id}
                                        className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
                                    >
                                        <Checkbox
                                            checked={data.student_ids.includes(
                                                studentId,
                                            )}
                                            onCheckedChange={(checked) =>
                                                toggleStudent(
                                                    studentId,
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-medium">
                                                {student.name}
                                            </span>
                                            <span className="block truncate text-xs text-muted-foreground">
                                                {student.email}
                                            </span>
                                        </span>
                                    </label>
                                );
                            })}
                            {students.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No users with the user role are available.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href={path}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <Spinner />
                            ) : (
                                <Save className="size-4" />
                            )}
                            {isEdit ? 'Save class' : 'Create class'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
    error,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    error?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full">
                    <SelectValue
                        placeholder={`Select ${label.toLowerCase()}`}
                    />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <InputError message={error} />
        </div>
    );
}

ClassManagementForm.layout = {
    breadcrumbs: [
        { title: 'Academic Management', href: '/academic/faculties' },
        { title: 'Classes', href: path },
    ],
};
