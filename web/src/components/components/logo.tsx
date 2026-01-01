import hittlyLogo from '../../assets/hittly-logo.png';

export function Logo({ withText = true }: { withText?: boolean }) {
    return (
      <div className="flex items-center gap-2">
        <img 
          src={hittlyLogo} 
          alt="Hittly" 
          className="h-8 w-auto rounded-lg"
        />
        {withText && <span className="text-xl font-semibold text-purple-900">Hittly</span>}
      </div>
    );
  }