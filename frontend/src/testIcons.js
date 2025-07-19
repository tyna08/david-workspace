import React from 'react';
import { 
  Upload, FileText, CheckCircle, Clock, ExternalLink, User, BookOpen, 
  Plus, Send, Calculator, Globe, Beaker, Atom, Heart, BookText, Scroll, 
  ChevronLeft, GraduationCap, Play, Keyboard, Timer, Image 
} from 'lucide-react';

const TestIcons = () => {
  const icons = {
    Upload, FileText, CheckCircle, Clock, ExternalLink, User, BookOpen,
    Plus, Send, Calculator, Globe, Beaker, Atom, Heart, BookText, Scroll,
    ChevronLeft, GraduationCap, Play, Keyboard, Timer, Image
  };

  console.log('Icon check:');
  Object.entries(icons).forEach(([name, icon]) => {
    console.log(`${name}: ${icon ? '✓' : '✗ UNDEFINED'}`);
  });

  return (
    <div>
      <h2>Icon Test</h2>
      {Object.entries(icons).map(([name, Icon]) => (
        <div key={name}>
          {name}: {Icon ? <Icon size={20} /> : 'UNDEFINED'}
        </div>
      ))}
    </div>
  );
};

export default TestIcons;