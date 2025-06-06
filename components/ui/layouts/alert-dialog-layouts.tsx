import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';


export function AlertDialogContentLayout({
  footer,
  children,
  title,
  description,
}: {
  footer: () => React.ReactNode;
  children?: React.ReactNode;
  title?: string;
  description?: string;
}) {

  return (
    <AlertDialogContent>
      {(title ?? description) && (
        <AlertDialogHeader>
          {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
          {description && (
            <AlertDialogDescription className="text-center">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
      )}
      {children}
      <AlertDialogFooter>{footer()}</AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function AlertDialogWTriggerLayout({
  footer,
  children,
  title,
  description,
  tooltip,
  reset,
  trigger = () => {return <div></div>},
}: {
  footer: () => React.ReactNode;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  tooltip?: string;
  reset?: () => void;
  trigger?: () => React.ReactNode;
}) {

  return (
    <AlertDialog onOpenChange={(open) => !open && reset ? reset() : {}}>
      <AlertDialogTrigger asChild>
        <div className='size-full'>
          {tooltip ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {trigger()}
                </TooltipTrigger>
                <TooltipContent className="bg-muted">
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            trigger()
          )}
        </div>
      </AlertDialogTrigger>
      <AlertDialogContentLayout
        footer={footer}
        description={description}
        title={title}
      >
        {children}
      </AlertDialogContentLayout>
    </AlertDialog>
  );
}

export function AlertDialogWSetOpenLayout({
  footer,
  children,
  title,
  description,
  reset,
  setOpen,
}: {
  footer: () => React.ReactNode;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  reset?: () => void;
  setOpen?: (open: boolean) => void;
}) {
  
  function onOpenChange(open: boolean) {
    if(setOpen) setOpen(open);

    if (!open && reset) reset();
  }

  return (
    <AlertDialog open onOpenChange={(open) => onOpenChange(open)}>
      <AlertDialogContentLayout
        footer={footer}
        description={description}
        title={title}
      >
        {children}
      </AlertDialogContentLayout>
    </AlertDialog>
  );
}

export function DeleteDialogLayout({
  footer,
  children,
  title,
  description,
  label,
  tooltip,
  reset,
  setOpen,
  trigger,
}: {
  footer: () => React.ReactNode;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  label?: string;
  tooltip?: string;
  reset?: () => void;
  setOpen?: (open: boolean) => void;
  trigger?: () => React.ReactNode;
}) {
  const descript = description ??
    `This action cannot be undone. This will permanently delete ${label ? `the ${label} that were selected` : 'the selected items'} and remove the data from the server.`;

  if(trigger){
    return (
      <AlertDialogWTriggerLayout
        footer={footer}
        title={title}
        reset={reset}
        trigger={trigger}
        description={descript}
        tooltip={tooltip}
      >
        {children}
      </AlertDialogWTriggerLayout>
    )
  }else{
    return (
      <AlertDialogWSetOpenLayout
        footer={footer}
        title={title}
        reset={reset}
        setOpen={setOpen}
        description={descript}
      >
        {children}
      </AlertDialogWSetOpenLayout>
    );
  }
}