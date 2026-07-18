import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type Program = {
    id: number;
    code: string;
    name: string;
};

export type CourseFormRecord = {
    id: number;
    code: string;
    name: string;
    credits: number;
    description: string | null;
};

export function CourseFormDialog({
    program,
    course,
    onClose,
}: {
    program: Program;
    course: CourseFormRecord | null;
    onClose: () => void;
}) {
    const isEdit = course !== null;
    const { data, setData, errors, processing, post, put } = useForm({
        name: course?.name ?? '',
        code: course?.code ?? '',
        credits: String(course?.credits ?? 3),
        description: course?.description ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: onClose,
        };

        if (course) {
            put(
                `/academic/programs/${program.id}/courses/${course.id}`,
                options,
            );

            return;
        }

        post(`/academic/programs/${program.id}/courses`, options);
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                <form onSubmit={submit} className="space-y-6">
                    <DialogHeader>
                        <DialogTitle>
                            {isEdit ? 'Edit course' : 'Create course'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEdit ? 'Update' : 'Add'} a course in{' '}
                            {program.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="course-name">Course name</Label>
                            <Input
                                id="course-name"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                placeholder="Introduction to Programming"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="course-code">Code</Label>
                            <Input
                                id="course-code"
                                value={data.code}
                                onChange={(event) =>
                                    setData('code', event.target.value)
                                }
                                placeholder="IT101"
                            />
                            {errors.code && (
                                <p className="text-sm text-destructive">
                                    {errors.code}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="course-credits">Credits</Label>
                            <Input
                                id="course-credits"
                                type="number"
                                min="1"
                                max="30"
                                value={data.credits}
                                onChange={(event) =>
                                    setData('credits', event.target.value)
                                }
                            />
                            {errors.credits && (
                                <p className="text-sm text-destructive">
                                    {errors.credits}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="course-description">
                                Description
                            </Label>
                            <textarea
                                id="course-description"
                                value={data.description}
                                onChange={(event) =>
                                    setData('description', event.target.value)
                                }
                                placeholder="Course summary and learning outcomes"
                                className="min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive">
                                    {errors.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <Spinner />
                            ) : (
                                <Save className="size-4" />
                            )}
                            {isEdit ? 'Save changes' : 'Create course'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
